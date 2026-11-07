/**
 * @module ol-copc/points
 */

/**
 * @typedef {Object} PointView
 * @property {number} pointCount The number of points.
 * @property {function(string): function(number): number} getter Returns a getter for a dimension.
 */

/**
 * Reads the points of a LAS view, without the withheld points.
 * @param {PointView} view The view on the decompressed points.
 * @param {boolean} colors Whether the points have colors.
 * @param {function(Array<number>): Array<number>} forward Transforms the coordinates to the projection of the map.
 * @return {import("./worker/COPC.js").Points} The points.
 */
export function readPoints(view, colors, forward) {
  const count = view.pointCount;
  const getX = view.getter('X');
  const getY = view.getter('Y');
  const getZ = view.getter('Z');
  const getIntensity = view.getter('Intensity');
  const getClassification = view.getter('Classification');
  const isWithheld = view.getter('Withheld');
  const getColors = colors
    ? [view.getter('Red'), view.getter('Green'), view.getter('Blue')]
    : [];
  const data = {
    count,
    origin: [0, 0],
    xy: new Float32Array(count * 2),
    z: new Float32Array(count),
    rgb: colors ? new Uint16Array(count * 3) : null,
    classification: new Uint8Array(count),
    intensity: new Uint16Array(count),
  };
  let n = 0;
  for (let i = 0; i < count; i++) {
    // Withheld points are to be considered deleted (LAS 1.4)
    if (isWithheld(i)) {
      continue;
    }
    const [x, y] = forward([getX(i), getY(i)]);
    if (n === 0) {
      data.origin = [x, y];
    }
    data.xy[n * 2] = x - data.origin[0];
    data.xy[n * 2 + 1] = y - data.origin[1];
    data.z[n] = getZ(i);
    data.intensity[n] = getIntensity(i);
    data.classification[n] = getClassification(i);
    for (let c = 0; c < getColors.length; c++) {
      data.rgb[n * 3 + c] = getColors[c](i);
    }
    n++;
  }
  if (n < count) {
    data.count = n;
    data.xy = data.xy.slice(0, n * 2);
    data.z = data.z.slice(0, n);
    data.intensity = data.intensity.slice(0, n);
    data.classification = data.classification.slice(0, n);
    if (data.rgb) {
      data.rgb = data.rgb.slice(0, n * 3);
    }
  }
  return data;
}
