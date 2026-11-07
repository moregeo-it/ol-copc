import {Copc} from 'copc';
import {register} from 'ol/proj/proj4.js';
import proj4 from 'proj4';
import COPCSource from '../../../../../src/ol-copc/source/COPC.js';

vi.mock('copc', () => ({
  Copc: {
    create: vi.fn(),
    loadHierarchyPage: vi.fn(),
    loadCompressedPointDataBuffer: vi.fn(),
  },
}));

/**
 * @param {number} pointDataRecordFormat The point data record format.
 * @return {Promise<COPCSource>} A loaded source.
 */
async function createSource(pointDataRecordFormat) {
  vi.mocked(Copc.create).mockResolvedValue({
    header: {
      pointCount: 2,
      pointDataRecordFormat,
      pointDataRecordLength: 36,
      min: [0, 0, 0],
      max: [1, 1, 1],
    },
    eb: [],
    info: {
      cube: [0, 0, 0, 1, 1, 1],
      spacing: 0.1,
      rootHierarchyPage: {pageOffset: 0, pageLength: 32},
    },
  });
  vi.mocked(Copc.loadHierarchyPage).mockResolvedValue({
    nodes: {},
    pages: {},
  });
  const source = new COPCSource({
    url: 'https://example.com/points.copc.laz',
    projection: 'EPSG:4326',
  });
  await new Promise((resolve) => {
    const check = () => {
      if (source.getState() !== 'loading') {
        source.un('change', check);
        resolve();
      }
    };
    source.on('change', check);
  });
  return source;
}

/**
 * @param {Array<number>} rgb Interleaved colors of the root node.
 * @return {Object} The points of the root node.
 */
function createPoints(rgb) {
  return {
    z: new Float32Array([0, 1]),
    intensity: new Uint16Array([0, 0]),
    rgb: new Uint16Array(rgb),
  };
}

describe('ol-copc/source/COPC (colors)', function () {
  beforeEach(function () {
    register(proj4);
  });

  it('has colors for point formats with colors', async function () {
    const source = await createSource(7);
    expect(source.hasColors()).to.equal(true);
    source.updateStatistics_(createPoints([0, 0, 0, 10, 20, 30]));
    expect(source.hasColors()).to.equal(true);
    expect(source.getStatistics().colorScale).to.equal(257);
    source.dispose();
  });

  it('has no colors if all colors of the root node are black', async function () {
    const source = await createSource(7);
    source.updateStatistics_(createPoints([0, 0, 0, 0, 0, 0]));
    expect(source.hasColors()).to.equal(false);
    source.dispose();
  });

  it('has no colors for point formats without colors', async function () {
    const source = await createSource(6);
    expect(source.hasColors()).to.equal(false);
    source.dispose();
  });
});
