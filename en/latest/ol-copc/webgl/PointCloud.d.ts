export default WebGLPointCloud;
/**
 * GPU resources of an octree node.
 */
export type PointBuffers = {
    /**
     * The vertex array.
     */
    vao: WebGLVertexArrayObject;
    /**
     * The buffers.
     */
    buffers: Array<WebGLBuffer>;
    /**
     * The number of points.
     */
    count: number;
    /**
     * The origin of the coordinates in the projection of the map.
     */
    origin: Array<number>;
};
export type DrawCall = {
    /**
     * The points to draw.
     */
    points: PointBuffers;
    /**
     * The point size in CSS pixels.
     */
    pointSize: number;
};
export type Parameters = {
    /**
     * The elevation that is not shifted by the tilt.
     */
    ground: number;
    /**
     * The [min, max] elevations.
     */
    zRange: Array<number>;
    /**
     * The shift in map units per elevation unit (0 for a top-down view).
     */
    lean: number;
    /**
     * The map units per elevation unit.
     */
    elevationScale: number;
    /**
     * 0: RGB, 1: classification, 2: elevation, 3: intensity.
     */
    colorMode: number;
    /**
     * The [min, max] range for the colormap.
     */
    valueRange: Array<number>;
    /**
     * The factor to scale the colors to 16 bits.
     */
    colorScale: number;
    /**
     * The strength of the eye-dome lighting (0 disables it).
     */
    edl: number;
    /**
     * The maximum height of walls in elevation units (0 disables them).
     */
    wallHeight: number;
    /**
     * Whether points are shaded as domes.
     */
    shading: boolean;
};
/**
 * @classdesc
 * Draws point clouds with WebGL 2: the points are drawn as domes into an
 * offscreen target, which is composited with hole filling, walls (for the
 * oblique view) and eye-dome lighting.
 */
declare class WebGLPointCloud {
    /**
     * @type {HTMLCanvasElement}
     */
    canvas: HTMLCanvasElement;
    /**
     * @type {WebGL2RenderingContext}
     * @private
     */
    private gl_;
    /**
     * @private
     */
    private pointProgram_;
    /**
     * @private
     */
    private pointUniforms_;
    /**
     * @private
     */
    private compositeProgram_;
    /**
     * @private
     */
    private compositeUniforms_;
    /**
     * @private
     */
    private emptyVao_;
    /**
     * @private
     */
    private classTexture_;
    /**
     * @private
     */
    private rampTexture_;
    /**
     * @type {WebGLFramebuffer|null}
     * @private
     */
    private framebuffer_;
    /**
     * @type {Array<WebGLTexture>}
     * @private
     */
    private targets_;
    /**
     * @type {Array<number>}
     * @private
     */
    private targetSize_;
    /**
     * @return {WebGLTexture} The texture.
     * @private
     */
    private createLookupTexture_;
    /**
     * @param {Uint8Array} classes 256 RGBA colors for the classes.
     * @param {Uint8Array} ramp 256 RGBA colors for elevations and intensities.
     */
    setColors(classes: Uint8Array, ramp: Uint8Array): void;
    /**
     * @param {import("../worker/COPC.js").Points} data The point data.
     * @return {PointBuffers} The GPU resources.
     */
    createBuffers(data: import("../worker/COPC.js").Points): PointBuffers;
    /**
     * @param {PointBuffers} points The GPU resources.
     */
    deleteBuffers(points: PointBuffers): void;
    /**
     * @param {number} width The width in pixels.
     * @param {number} height The height in pixels.
     * @private
     */
    private updateTargets_;
    /**
     * @param {import("ol/Map.js").FrameState} frameState The frame state.
     * @param {Array<DrawCall>} drawCalls The points to draw, coarse levels first.
     * @param {Parameters} params The parameters.
     */
    render(frameState: import("ol/Map.js").FrameState, drawCalls: Array<DrawCall>, params: Parameters): void;
    /**
     * Releases the WebGL resources.
     */
    dispose(): void;
}
//# sourceMappingURL=PointCloud.d.ts.map