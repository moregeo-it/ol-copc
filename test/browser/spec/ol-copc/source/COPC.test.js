import COPCSource from '../../../../../src/ol-copc/source/COPC.js';

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

describe('ol/source/COPC', function () {
  it('requests byte ranges through the loader', async function () {
    const requests = [];
    const source = new COPCSource({
      url: 'https://example.com/points.copc.laz',
      headers: {Authorization: 'Bearer 123'},
      loader: (url, headers) => {
        requests.push({url, headers});
        return Promise.resolve(new Response('', {status: 404}));
      },
    });
    await whenLoaded(source);
    expect(requests.length).to.be.greaterThan(0);
    expect(requests[0].url).to.equal('https://example.com/points.copc.laz');
    expect(requests[0].headers.Authorization).to.equal('Bearer 123');
    expect(requests[0].headers.Range).to.match(/^bytes=0-\d+$/);
  });

  it('fails if the file can not be loaded', async function () {
    const source = new COPCSource({
      url: 'https://example.com/points.copc.laz',
      loader: () => Promise.resolve(new Response('', {status: 404})),
    });
    await whenLoaded(source);
    expect(source.getState()).to.equal('error');
    expect(source.getError().message).to.contain('404');
  });

  it('fails if the server does not support range requests', async function () {
    const source = new COPCSource({
      url: 'https://example.com/points.copc.laz',
      loader: () =>
        Promise.resolve(new Response(new Uint8Array(10), {status: 200})),
    });
    await whenLoaded(source);
    expect(source.getState()).to.equal('error');
    expect(source.getError().message).to.contain('range requests');
  });
});
