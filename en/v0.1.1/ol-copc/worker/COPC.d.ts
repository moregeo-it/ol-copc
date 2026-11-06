/** @type {function(): Worker} */ export let create: () => Worker;
/**
 * A projection that can be transferred to the worker.
 */
export type ProjectionDefinition = {
    /**
     * The code of the projection.
     */
    code: string;
    /**
     * The proj4 definition of the projection.
     */
    definition: string | any;
};
/**
 * The points of an octree node, ready for upload to the GPU.
 * The horizontal coordinates are in the projection of the map, relative to `origin`
 * so that they keep their precision as 32-bit floats.
 */
export type Points = {
    /**
     * The number of points.
     */
    count: number;
    /**
     * The origin of the coordinates in the projection of the map.
     */
    origin: Array<number>;
    /**
     * Interleaved coordinates relative to the origin.
     */
    xy: Float32Array;
    /**
     * Elevations.
     */
    z: Float32Array;
    /**
     * Interleaved colors, if available.
     */
    rgb: Uint16Array | null;
    /**
     * Classifications.
     */
    classification: Uint8Array;
    /**
     * Intensities.
     */
    intensity: Uint16Array;
};
//# sourceMappingURL=COPC.d.ts.map