export default COPCLayerRenderer;
export type LoadedNode = {
    /**
     * The GPU resources.
     */
    points: import("../webgl/PointCloud.js").PointBuffers;
    /**
     * The last frame in which the node was rendered.
     */
    lastUsed: number;
};
/**
 * @typedef {Object} LoadedNode
 * @property {import("../webgl/PointCloud.js").PointBuffers} points The GPU resources.
 * @property {number} lastUsed The last frame in which the node was rendered.
 */
/**
 * @classdesc
 * Renders a {@link module:ol/layer/COPC~COPCLayer}: selects the octree nodes for the
 * view, loads them through the source and draws them with WebGL.
 * @extends {LayerRenderer<import("../layer/COPC.js").default>}
 */
declare class COPCLayerRenderer extends LayerRenderer<import("../layer/COPC.js").default> {
    /**
     * @param {import("../layer/COPC.js").default} layer The layer.
     */
    constructor(layer: import("../layer/COPC.js").default);
    /**
     * @type {WebGLPointCloud|null}
     * @private
     */
    private pointCloud_;
    /**
     * @type {string}
     * @private
     */
    private colorsKey_;
    /**
     * @type {import("../source/COPC.js").default|null}
     * @private
     */
    private source_;
    /**
     * @type {string|null}
     * @private
     */
    private viewProjectionCode_;
    /**
     * The extents of the nodes in the projection of the map.
     * @type {Object<string, import("ol/extent.js").Extent>}
     * @private
     */
    private nodeExtents_;
    /**
     * Map units per horizontal unit of the point cloud.
     * @type {number}
     * @private
     */
    private horizontalScale_;
    /**
     * @type {Map<string, LoadedNode>}
     * @private
     */
    private loaded_;
    /**
     * @type {Set<string>}
     * @private
     */
    private loading_;
    /**
     * @type {number}
     * @private
     */
    private loadedPoints_;
    /**
     * @type {number}
     * @private
     */
    private frame_;
    /**
     * Incremented when the loaded nodes are dropped, so that pending
     * requests can be ignored.
     * @type {number}
     * @private
     */
    private generation_;
    /**
     * @type {Retries}
     * @private
     */
    private retries_;
    /**
     * Drops the loaded nodes if the source or the projection of the map changed.
     * @param {import("../source/COPC.js").default} source The source.
     * @param {import("ol/proj/Projection.js").default} viewProjection The projection of the map.
     * @private
     */
    private update_;
    /**
     * @private
     */
    private clear_;
    /**
     * @param {string} key The node key.
     * @return {import("ol/extent.js").Extent} The extent in the projection of the map.
     * @private
     */
    private getNodeExtent_;
    /**
     * @param {number} depth The depth in the octree.
     * @return {number} The spacing of the points at the depth in map units.
     * @private
     */
    private getSpacing_;
    /**
     * Selects the nodes to render, coarse nodes and nodes close to the center first.
     * @param {import("ol/Map.js").FrameState} frameState The frame state.
     * @param {number} reach How far points may be shifted by the tilt in map units.
     * @return {Array<string>} The node keys.
     * @private
     */
    private selectNodes_;
    /**
     * @param {string} key The node key.
     * @param {import("ol/proj/Projection.js").default} viewProjection The projection of the map.
     * @private
     */
    private loadNode_;
    /**
     * Releases the least recently used nodes that are not rendered.
     * @private
     */
    private releaseNodes_;
    /**
     * @private
     */
    private updateColors_;
    /**
     * Clips the rendered points to the extent of the layer (or its group).
     * @param {import("ol/Map.js").FrameState} frameState The frame state.
     * @param {import("ol/extent.js").Extent|undefined} extent The extent.
     * @return {string} The CSS clip path.
     * @private
     */
    private getClipPath_;
}
import LayerRenderer from 'ol/renderer/Layer.js';
//# sourceMappingURL=COPCLayer.d.ts.map