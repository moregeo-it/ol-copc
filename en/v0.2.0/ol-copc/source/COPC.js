/**
 * @module ol-copc/source/COPC
 */
import { Copc } from 'copc';
import BaseEvent from 'ol/events/Event.js';
import Source from 'ol/source/Source.js';
import proj4 from 'proj4';
import Retries from '../Retries.js';
import { registerWkt } from '../proj.js';
import COPCDecoderPool from './COPCDecoderPool.js';
/**
 * @enum {string}
 */
export const COPCSourceEventType = {
    /**
     * Triggered if the hierarchy or the points of an octree node can't be loaded.
     * @event COPCSourceEvent#nodeloaderror
     * @api
     */
    NODELOADERROR: 'nodeloaderror',
};
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
    constructor(type, key, error) {
        super(type);
        /**
         * The key of the octree node (`depth-x-y-z`).
         * @type {string}
         * @api
         */
        this.key = key;
        /**
         * The error.
         * @type {Error}
         * @api
         */
        this.error = error;
    }
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
 * @property {boolean} colors Whether the colors are filled, i.e. not all black.
 */
export const ROOT = '0-0-0-0';
/**
 * @param {string} url The URL.
 * @param {Object<string, string>} headers Additional headers.
 * @param {function(string, HeadersInit, AbortSignal): Promise<Response>} [loader] Custom loader function.
 * @return {function(number, number): Promise<Uint8Array>} The range getter.
 */
function createRangeGetter(url, headers = {}, loader = undefined) {
    const load = loader || ((url, headers, signal) => fetch(url, { headers, signal: signal }));
    return async (begin, end) => {
        const response = await load(url, Object.assign({}, headers, { Range: `bytes=${begin}-${end - 1}` }), new AbortController().signal);
        if (!response.ok) {
            throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
        }
        const buffer = new Uint8Array(await response.arrayBuffer());
        if (response.status !== 206 && buffer.byteLength !== end - begin) {
            throw new Error(`The server for ${url} doesn't support range requests`);
        }
        return buffer;
    };
}
/**
 * @param {import("ol/proj/Projection.js").default} projection The projection.
 * @return {import("../worker/COPC.js").ProjectionDefinition} The definition.
 * @throws {Error} If the projection is not registered with proj4.
 */
function getProjectionDefinition(projection) {
    const code = projection.getCode();
    const definition = proj4.defs(code);
    if (!definition) {
        throw new Error(`The projection ${code} must be registered with proj4`);
    }
    return { code, definition };
}
/**
 * @param {ArrayLike<number>} values The values.
 * @param {number} quantile The quantile (0-1).
 * @return {number} The value at the quantile.
 */
function getQuantile(values, quantile) {
    const sorted = Float64Array.from(values).sort();
    return sorted[Math.floor((sorted.length - 1) * quantile)];
}
/**
 * @classdesc
 * A source for Cloud Optimized Point Clouds (COPC), to be rendered with a
 * {@link module:ol/layer/COPC~COPCLayer}.
 * Loads the metadata and the octree hierarchy, the points are decoded in web workers.
 * @api
 */
class COPCSource extends Source {
    /**
     * @param {Options} options The options.
     */
    constructor(options) {
        super({
            attributions: options.attributions,
            projection: options.projection,
            state: 'loading',
        });
        /**
         * @type {function(number, number): Promise<Uint8Array>}
         * @private
         */
        this.getter_ = createRangeGetter(options.url, options.headers, options.loader);
        /**
         * @type {import("copc").Copc|null}
         * @private
         */
        this.copc_ = null;
        /**
         * @type {Object<string, import("copc").Hierarchy.Node|undefined>}
         * @private
         */
        this.nodes_ = {};
        /**
         * @type {Object<string, import("copc").Hierarchy.Page|undefined>}
         * @private
         */
        this.pages_ = {};
        /**
         * @type {Object<string, Promise<void>>}
         * @private
         */
        this.pageRequests_ = {};
        /**
         * @type {Retries}
         * @private
         */
        this.pageRetries_ = new Retries();
        /**
         * @type {number}
         * @private
         */
        this.maxDepth_ = 0;
        /**
         * @type {Statistics|null}
         * @private
         */
        this.statistics_ = null;
        /**
         * @type {COPCDecoderPool|null}
         * @private
         */
        this.pool_ = null;
        /**
         * @type {Error|null}
         * @private
         */
        this.error_ = null;
        this.init_(options).then(() => {
            if (!this.disposed) {
                this.setState('ready');
            }
        }, (error) => {
            this.error_ = error;
            this.setState('error');
        });
    }
    /**
     * @param {Options} options The options.
     * @private
     */
    async init_(options) {
        const copc = await Copc.create(this.getter_);
        this.addHierarchy_(await Copc.loadHierarchyPage(this.getter_, copc.info.rootHierarchyPage));
        if (!this.projection) {
            if (!copc.wkt) {
                throw new Error('The point cloud does not specify a coordinate reference system');
            }
            this.projection = registerWkt(copc.wkt);
        }
        this.copc_ = copc;
        // Don't create workers that can't be terminated anymore
        if (this.disposed) {
            return;
        }
        this.pool_ = new COPCDecoderPool({
            header: copc.header,
            eb: copc.eb,
            projection: getProjectionDefinition(this.projection),
        }, options.workers, (error) => {
            this.error_ = error;
            this.setState('error');
        });
    }
    /**
     * @return {Error|null} The error, if the source failed to load.
     * @api
     */
    getError() {
        return this.error_;
    }
    /**
     * @return {import("copc").Copc|null} The COPC metadata (header, VLRs, info), once loaded.
     * @api
     */
    getMetadata() {
        return this.copc_;
    }
    /**
     * Colors that are all black (e.g. not filled) count as no colors once the root node is loaded.
     * @return {boolean} Whether the points have colors.
     * @api
     */
    hasColors() {
        var _a;
        return (this.copc_ !== null &&
            [2, 3, 5, 7, 8, 10].includes(this.copc_.header.pointDataRecordFormat) &&
            ((_a = this.statistics_) === null || _a === void 0 ? void 0 : _a.colors) !== false);
    }
    /**
     * @return {Statistics|null} The statistics, once the root node is loaded.
     * @api
     */
    getStatistics() {
        return this.statistics_;
    }
    /**
     * @return {number} The deepest level of the octree loaded so far.
     */
    getMaxDepth() {
        return this.maxDepth_;
    }
    /**
     * @return {number} The maximum number of tasks that can run in parallel.
     */
    getConcurrency() {
        return this.pool_ ? this.pool_.getConcurrency() : 1;
    }
    /**
     * Returns a node of the octree. Loads the hierarchy page of the node if needed,
     * the source changes once it is loaded.
     * @param {string} key The node key (`depth-x-y-z`).
     * @return {import("copc").Hierarchy.Node|undefined} The node, if loaded and available.
     */
    getNode(key) {
        const node = this.nodes_[key];
        if (!node &&
            this.pages_[key] &&
            !this.pageRequests_[key] &&
            this.pageRetries_.canTry(key)) {
            this.pageRequests_[key] = Copc.loadHierarchyPage(this.getter_, this.pages_[key]).then((subtree) => {
                this.pageRetries_.succeed(key);
                this.addHierarchy_(subtree);
                this.changed();
            }, (error) => {
                delete this.pageRequests_[key];
                this.dispatchEvent(new COPCSourceEvent(COPCSourceEventType.NODELOADERROR, key, error));
                const delay = this.pageRetries_.fail(key);
                if (delay !== null) {
                    setTimeout(() => this.changed(), delay);
                }
            });
        }
        return node;
    }
    /**
     * @param {import("copc").Hierarchy.Subtree} subtree The hierarchy subtree.
     * @private
     */
    addHierarchy_(subtree) {
        Object.assign(this.nodes_, subtree.nodes);
        Object.assign(this.pages_, subtree.pages);
        for (const key in subtree.nodes) {
            this.maxDepth_ = Math.max(this.maxDepth_, parseInt(key, 10));
        }
    }
    /**
     * Loads the points of a node. Failures are also reported through the
     * `nodeloaderror` event.
     * @param {string} key The node key.
     * @param {import("ol/proj/Projection.js").default} projection The projection of the map.
     * @return {Promise<import("../worker/COPC.js").Points>} The points.
     */
    async loadPoints(key, projection) {
        try {
            return await this.loadPoints_(key, projection);
        }
        catch (error) {
            this.dispatchEvent(new COPCSourceEvent(COPCSourceEventType.NODELOADERROR, key, error));
            throw error;
        }
    }
    /**
     * @param {string} key The node key.
     * @param {import("ol/proj/Projection.js").default} projection The projection of the map.
     * @return {Promise<import("../worker/COPC.js").Points>} The points.
     * @private
     */
    async loadPoints_(key, projection) {
        const node = this.nodes_[key];
        // Requests are made on the main thread, the workers only decompress (like for GeoTIFF)
        const compressed = await Copc.loadCompressedPointDataBuffer(this.getter_, node);
        const buffer = compressed.byteOffset === 0 &&
            compressed.byteLength === compressed.buffer.byteLength
            ? compressed.buffer
            : compressed.slice().buffer;
        const data = await this.pool_.decode(
        /** @type {ArrayBuffer} */ (buffer), node.pointCount, getProjectionDefinition(projection));
        if (key === ROOT && !this.statistics_ && data.count > 0) {
            this.updateStatistics_(data);
        }
        return data;
    }
    /**
     * @param {import("../worker/COPC.js").Points} data The points of the root node.
     * @private
     */
    updateStatistics_(data) {
        let colorScale = 1;
        let colors = false;
        if (data.rgb) {
            let max = 0;
            for (let i = 0; i < data.rgb.length; i++) {
                max = Math.max(max, data.rgb[i]);
            }
            // 8-bit colors stored in 16 bits
            colorScale = max <= 255 ? 257 : 1;
            colors = max > 0;
        }
        this.statistics_ = {
            ground: getQuantile(data.z, 0.1),
            top: getQuantile(data.z, 0.995),
            intensity: getQuantile(data.intensity, 0.99),
            colorScale,
            colors,
        };
        this.changed();
    }
    /**
     * @override
     */
    disposeInternal() {
        if (this.pool_) {
            this.pool_.dispose();
        }
        super.disposeInternal();
    }
}
export default COPCSource;
//# sourceMappingURL=COPC.js.map