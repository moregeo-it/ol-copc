export default COPCDecoderPool;
export type Task = {
    /**
     * Resolves the task.
     */
    resolve: (arg0: import("../worker/COPC.js").Points) => void;
    /**
     * Rejects the task.
     */
    reject: (arg0: Error) => void;
};
export type Metadata = {
    /**
     * The LAS header.
     */
    header: import("copc").Las.Header;
    /**
     * The extra bytes.
     */
    eb: Array<import("copc").Las.ExtraBytes>;
    /**
     * The projection of the point cloud.
     */
    projection: import("../worker/COPC.js").ProjectionDefinition;
};
/**
 * @classdesc
 * Decompresses COPC nodes and transforms the points in web workers.
 */
declare class COPCDecoderPool {
    /**
     * @param {Metadata} metadata The metadata of the point cloud.
     * @param {number} [size] The number of workers.
     * @param {function(Error): void} [onError] Called if the workers fail to load.
     */
    constructor(metadata: Metadata, size?: number, onError?: (arg0: Error) => void);
    /**
     * @type {Array<Worker>}
     * @private
     */
    private workers_;
    /**
     * @type {Map<number, Task>}
     * @private
     */
    private tasks_;
    /**
     * @type {number}
     * @private
     */
    private taskId_;
    /**
     * @type {function(Error): void}
     * @private
     */
    private onError_;
    /**
     * @return {number} The number of tasks that can run in parallel.
     */
    getConcurrency(): number;
    /**
     * @param {Error} error The error.
     * @private
     */
    private fail_;
    /**
     * @param {ArrayBuffer} buffer The compressed points, transferred to the worker.
     * @param {number} pointCount The number of points.
     * @param {import("../worker/COPC.js").ProjectionDefinition} target The projection of the map.
     * @return {Promise<import("../worker/COPC.js").Points>} The points.
     */
    decode(buffer: ArrayBuffer, pointCount: number, target: import("../worker/COPC.js").ProjectionDefinition): Promise<import("../worker/COPC.js").Points>;
    /**
     * Terminates the workers and rejects the pending tasks.
     * @param {Error} [error] The reason.
     */
    dispose(error?: Error): void;
}
//# sourceMappingURL=COPCDecoderPool.d.ts.map