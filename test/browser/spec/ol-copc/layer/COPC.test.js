import COPCLayer from '../../../../../src/ol-copc/layer/COPC.js';

/**
 * A source stub, as the layer only asks the source for the colors.
 * @param {boolean} colors Whether the points have colors.
 * @return {*} The source.
 */
function createSource(colors) {
  return {
    hasColors: () => colors,
    getState: () => 'ready',
    on: () => {},
    un: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

describe('ol/layer/COPC', function () {
  it('has a top-down view by default', function () {
    const layer = new COPCLayer({source: createSource(true)});
    expect(layer.getTilt()).to.equal(0);
    expect(layer.getPointSize()).to.equal(2);
    expect(layer.getEDL()).to.equal(1);
    expect(layer.getWalls()).to.equal(true);
    expect(layer.getShading()).to.equal(true);
    expect(layer.getHideNoise()).to.equal(false);
  });

  it('limits the tilt', function () {
    const layer = new COPCLayer({source: createSource(true), tilt: 90});
    expect(layer.getTilt()).to.equal(75);
    layer.setTilt(-10);
    expect(layer.getTilt()).to.equal(0);
    layer.setTilt(45);
    expect(layer.getTilt()).to.equal(45);
  });

  it('colors by RGB if the points have colors, by elevation otherwise', function () {
    expect(new COPCLayer({source: createSource(true)}).getColorMode()).to.equal(
      'rgb',
    );
    expect(
      new COPCLayer({source: createSource(false)}).getColorMode(),
    ).to.equal('elevation');
  });

  it('can be changed', function () {
    const layer = new COPCLayer({source: createSource(true)});
    let changes = 0;
    layer.on('change', () => changes++);
    layer.setColorMode('classification');
    layer.setPointSize(3);
    layer.setEDL(0);
    layer.setWalls(false);
    layer.setHideNoise(true);
    expect(layer.getColorMode()).to.equal('classification');
    expect(layer.getPointSize()).to.equal(3);
    expect(layer.getEDL()).to.equal(0);
    expect(layer.getWalls()).to.equal(false);
    expect(layer.getHideNoise()).to.equal(true);
    expect(changes).to.equal(5);
  });
});
