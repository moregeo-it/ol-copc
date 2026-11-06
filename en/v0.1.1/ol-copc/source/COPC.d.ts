export type COPCSourceEventType = string;
export namespace COPCSourceEventType {
    let NODELOADERROR: string;
}
/**
 * @classdesc
 * Events emitted by {@link module:ol-copc/source/COPC~COPCSource} instances.
 */
export class COPCSourceEvent extends BaseEvent {
    /**
     * @param {string} type The event type.
     * @param {string} key The key of the octree node.
     * @param {Error} error The error.
     */
    constructor(type: string, key: string, error: Error);
    /**
     * The key of the octree node (`depth-x-y-z`).
     * @type {string}
     * @api
     */
    key: string;
    /**
     * The error.
     * @type {Error}
     * @api
     */
    error: Error;
}
/**
 * @typedef {Object} Options
 * @property {string} url The URL of the COPC file. The server must support HTTP range requests.
 * @property {Object<string, string>} [headers] Additional headers for the requests.
 * @property {function(string, HeadersInit, AbortSignal): Promise<Response>} [loader] Custom loader function.
 * Called with the URL, the request headers (including the `Range` header) and an abort signal.
 * Expected to resolve with a `Response`.
 * @property {import("ol/proj.js").ProjectionLike} [projection] The projection of the point cloud.
 * Read from the WKT in the file by default. Must be registered with proj4.
 * @property {import("ol/source/Source.js").AttributionLike} [attributions] Attributions.
 * @property {number} [workers] The number of web workers that decompress the points.
 * Defaults to the number of logical processors minus one (1 to 4).
 */
/**
 * Statistics estimated from the root node of the octree.
 * @typedef {Object} Statistics
 * @property {number} ground The elevation of the ground (10th percentile).
 * @property {number} top The elevation of the highest objects without outliers (99.5th percentile).
 * @property {number} intensity The highest intensity without outliers (99th percentile).
 * @property {number} colorScale The factor to scale the colors to 16 bits.
 */
export const ROOT: "0-0-0-0";
export default COPCSource;
export type Options = {
    /**
     * The URL of the COPC file. The server must support HTTP range requests.
     */
    url: string;
    /**
     * Additional headers for the requests.
     */
    headers?: {
        [x: string]: string;
    } | undefined;
    /**
     * Custom loader function.
     * Called with the URL, the request headers (including the `Range` header) and an abort signal.
     * Expected to resolve with a `Response`.
     */
    loader?: ((arg0: string, arg1: HeadersInit, arg2: AbortSignal) => Promise<Response>) | undefined;
    /**
     * The projection of the point cloud.
     * Read from the WKT in the file by default. Must be registered with proj4.
     */
    projection?: import("ol/proj.js").ProjectionLike;
    /**
     * Attributions.
     */
    attributions?: import("ol/source/Source.js").AttributionLike | undefined;
    /**
     * The number of web workers that decompress the points.
     * Defaults to the number of logical processors minus one (1 to 4).
     */
    workers?: number | undefined;
};
/**
 * Statistics estimated from the root node of the octree.
 */
export type Statistics = {
    /**
     * The elevation of the ground (10th percentile).
     */
    ground: number;
    /**
     * The elevation of the highest objects without outliers (99.5th percentile).
     */
    top: number;
    /**
     * The highest intensity without outliers (99th percentile).
     */
    intensity: number;
    /**
     * The factor to scale the colors to 16 bits.
     */
    colorScale: number;
};
import BaseEvent from 'ol/events/Event.js';
/**
 * @classdesc
 * A source for Cloud Optimized Point Clouds (COPC), to be rendered with a
 * {@link module:ol/layer/COPC~COPCLayer}.
 * Loads the metadata and the octree hierarchy, the points are decoded in web workers.
 * @api
 */
declare class COPCSource extends Source {
    /**
     * @param {Options} options The options.
     */
    constructor(options: Options);
    /**
     * @type {function(number, number): Promise<Uint8Array>}
     * @private
     */
    private getter_;
    /**
     * @type {import("copc").Copc|null}
     * @private
     */
    private copc_;
    /**
     * @type {Object<string, import("copc").Hierarchy.Node|undefined>}
     * @private
     */
    private nodes_;
    /**
     * @type {Object<string, import("copc").Hierarchy.Page|undefined>}
     * @private
     */
    private pages_;
    /**
     * @type {Object<string, Promise<void>>}
     * @private
     */
    private pageRequests_;
    /**
     * @type {Retries}
     * @private
     */
    private pageRetries_;
    /**
     * @type {number}
     * @private
     */
    private maxDepth_;
    /**
     * @type {Statistics|null}
     * @private
     */
    private statistics_;
    /**
     * @type {COPCDecoderPool|null}
     * @private
     */
    private pool_;
    /**
     * @type {Error|null}
     * @private
     */
    private error_;
    /**
     * @param {Options} options The options.
     * @private
     */
    private init_;
    /**
     * @return {Error|null} The error, if the source failed to load.
     * @api
     */
    getError(): Error | null;
    /**
     * @return {import("copc").Copc|null} The COPC metadata (header, VLRs, info), once loaded.
     * @api
     */
    getMetadata(): import("copc").Copc | null;
    /**
     * @return {boolean} Whether the points have colors.
     * @api
     */
    hasColors(): boolean;
    /**
     * @return {Statistics|null} The statistics, once the root node is loaded.
     * @api
     */
    getStatistics(): Statistics | null;
    /**
     * @return {number} The deepest level of the octree loaded so far.
     */
    getMaxDepth(): number;
    /**
     * @return {number} The maximum number of tasks that can run in parallel.
     */
    getConcurrency(): number;
    /**
     * Returns a node of the octree. Loads the hierarchy page of the node if needed,
     * the source changes once it is loaded.
     * @param {string} key The node key (`depth-x-y-z`).
     * @return {import("copc").Hierarchy.Node|undefined} The node, if loaded and available.
     */
    getNode(key: string): import("copc").Hierarchy.Node | undefined;
    /**
     * @param {import("copc").Hierarchy.Subtree} subtree The hierarchy subtree.
     * @private
     */
    private addHierarchy_;
    /**
     * Loads the points of a node. Failures are also reported through the
     * `nodeloaderror` event.
     * @param {string} key The node key.
     * @param {import("ol/proj/Projection.js").default} projection The projection of the map.
     * @return {Promise<import("../worker/COPC.js").Points>} The points.
     */
    loadPoints(key: string, projection: import("ol/proj/Projection.js").default): Promise<import("../worker/COPC.js").Points>;
    /**
     * @param {string} key The node key.
     * @param {import("ol/proj/Projection.js").default} projection The projection of the map.
     * @return {Promise<import("../worker/COPC.js").Points>} The points.
     * @private
     */
    private loadPoints_;
    /**
     * @param {import("../worker/COPC.js").Points} data The points of the root node.
     * @private
     */
    private updateStatistics_;
}
import Source from 'ol/source/Source.js';
//# sourceMappingURL=COPC.d.ts.map