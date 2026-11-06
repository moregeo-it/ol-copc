import {Copc} from 'copc';
import {register} from 'ol/proj/proj4.js';
import proj4 from 'proj4';
import COPCSource, {
  COPCSourceEventType,
} from '../../../../../src/ol-copc/source/COPC.js';

vi.mock('copc', () => ({
  Copc: {
    create: vi.fn(),
    loadHierarchyPage: vi.fn(),
    loadCompressedPointDataBuffer: vi.fn(),
  },
}));

const METADATA = {
  header: {
    pointCount: 1,
    pointDataRecordFormat: 6,
    pointDataRecordLength: 30,
    min: [0, 0, 0],
    max: [1, 1, 1],
  },
  eb: [],
  info: {
    cube: [0, 0, 0, 1, 1, 1],
    spacing: 0.1,
    rootHierarchyPage: {pageOffset: 0, pageLength: 32},
  },
};

const ROOT_PAGE = {
  nodes: {
    '0-0-0-0': {pointCount: 1, pointDataOffset: 0, pointDataLength: 10},
  },
  pages: {'1-0-0-0': {pageOffset: 32, pageLength: 32}},
};

/**
 * @param {COPCSource} source The source.
 * @return {Promise<void>} Resolves once the source is no longer loading.
 */
function whenLoaded(source) {
  return new Promise((resolve) => {
    const check = () => {
      if (source.getState() !== 'loading') {
        source.un('change', check);
        resolve();
      }
    };
    source.on('change', check);
  });
}

/**
 * @return {COPCSource} A source in EPSG:4326 with the root page.
 */
function createSource() {
  return new COPCSource({
    url: 'https://example.com/points.copc.laz',
    projection: 'EPSG:4326',
  });
}

describe('ol-copc/source/COPC (errors)', function () {
  beforeEach(function () {
    register(proj4);
    vi.mocked(Copc.create).mockReset();
    vi.mocked(Copc.loadHierarchyPage).mockReset();
    vi.mocked(Copc.loadCompressedPointDataBuffer).mockReset();
  });

  it('does not create workers if disposed while loading', async function () {
    let resolve;
    vi.mocked(Copc.create).mockReturnValue(new Promise((r) => (resolve = r)));
    vi.mocked(Copc.loadHierarchyPage).mockResolvedValue(ROOT_PAGE);
    const source = createSource();
    source.dispose();
    resolve(METADATA);
    await new Promise((r) => setTimeout(r, 0));
    expect(/** @type {*} */ (source).pool_).to.equal(null);
    expect(source.getState()).to.equal('loading');
  });

  it('reports failed hierarchy pages and does not retry them right away', async function () {
    vi.mocked(Copc.create).mockResolvedValue(METADATA);
    vi.mocked(Copc.loadHierarchyPage)
      .mockResolvedValueOnce(ROOT_PAGE)
      .mockRejectedValue(new Error('Network error'));
    const source = createSource();
    await whenLoaded(source);
    expect(source.getState()).to.equal('ready');

    const errors = [];
    source.on(COPCSourceEventType.NODELOADERROR, (event) => errors.push(event));
    expect(source.getNode('1-0-0-0')).to.equal(undefined);
    await new Promise((r) => setTimeout(r, 0));
    expect(errors.length).to.equal(1);
    expect(errors[0].key).to.equal('1-0-0-0');
    expect(errors[0].error.message).to.equal('Network error');

    source.getNode('1-0-0-0');
    expect(Copc.loadHierarchyPage).toHaveBeenCalledTimes(2);
    source.dispose();
  });

  it('reports failed points', async function () {
    vi.mocked(Copc.create).mockResolvedValue(METADATA);
    vi.mocked(Copc.loadHierarchyPage).mockResolvedValue(ROOT_PAGE);
    vi.mocked(Copc.loadCompressedPointDataBuffer).mockRejectedValue(
      new Error('Network error'),
    );
    const source = createSource();
    await whenLoaded(source);

    const errors = [];
    source.on(COPCSourceEventType.NODELOADERROR, (event) => errors.push(event));
    let rejected = null;
    try {
      await source.loadPoints('0-0-0-0', source.getProjection());
    } catch (error) {
      rejected = error;
    }
    expect(rejected.message).to.equal('Network error');
    expect(errors.length).to.equal(1);
    expect(errors[0].key).to.equal('0-0-0-0');
    source.dispose();
  });
});
