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
export function readPoints(view: PointView, colors: boolean, forward: (arg0: Array<number>) => Array<number>): import("./worker/COPC.js").Points;
export type PointView = {
    /**
     * The number of points.
     */
    pointCount: number;
    /**
     * Returns a getter for a dimension.
     */
    getter: (arg0: string) => (arg0: number) => number;
};
//# sourceMappingURL=points.d.ts.map