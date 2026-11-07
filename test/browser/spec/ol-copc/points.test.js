import {readPoints} from '../../../../src/ol-copc/points.js';

/**
 * @param {Object<string, Array<number>>} dimensions The values per dimension.
 * @return {import("../../../../src/ol-copc/points.js").PointView} The view.
 */
function createView(dimensions) {
  return {
    pointCount: dimensions.X.length,
    getter: (name) => (index) => dimensions[name][index],
  };
}

describe('ol-copc/points', function () {
  const identity = (coordinate) => coordinate;

  it('reads the points relative to the first point', function () {
    const view = createView({
      X: [10, 11],
      Y: [20, 22],
      Z: [1, 2],
      Intensity: [100, 200],
      Classification: [2, 6],
      Withheld: [0, 0],
    });
    const data = readPoints(view, false, identity);
    expect(data.count).to.equal(2);
    expect(data.origin).to.eql([10, 20]);
    expect(Array.from(data.xy)).to.eql([0, 0, 1, 2]);
    expect(Array.from(data.z)).to.eql([1, 2]);
    expect(Array.from(data.classification)).to.eql([2, 6]);
    expect(data.rgb).to.equal(null);
  });

  it('skips withheld points', function () {
    const view = createView({
      X: [10, 11, 12],
      Y: [20, 21, 22],
      Z: [1, 2, 3],
      Intensity: [100, 200, 300],
      Classification: [2, 7, 6],
      Withheld: [1, 0, 1],
      Red: [1, 2, 3],
      Green: [4, 5, 6],
      Blue: [7, 8, 9],
    });
    const data = readPoints(view, true, identity);
    expect(data.count).to.equal(1);
    expect(data.origin).to.eql([11, 21]);
    expect(Array.from(data.xy)).to.eql([0, 0]);
    expect(Array.from(data.z)).to.eql([2]);
    expect(Array.from(data.intensity)).to.eql([200]);
    expect(Array.from(data.classification)).to.eql([7]);
    expect(Array.from(data.rgb)).to.eql([2, 5, 8]);
  });
});
