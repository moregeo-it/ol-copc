/**
 * @module ol-copc/Retries
 */
/**
 * The maximum number of attempts to load something.
 */
export const MAX_ATTEMPTS: 3;
export default Retries;
/**
 * @classdesc
 * Keeps track of failed attempts to load something (e.g. octree nodes), so that
 * they are retried a limited number of times with an increasing delay.
 */
declare class Retries {
    /**
     * @type {Map<string, {count: number, retryAt: number}>}
     * @private
     */
    private failures_;
    /**
     * @param {string} key The key.
     * @return {boolean} Whether it can be (re)tried now.
     */
    canTry(key: string): boolean;
    /**
     * Records a failed attempt.
     * @param {string} key The key.
     * @return {number|null} The delay until the next attempt in milliseconds,
     * or `null` if there are no attempts left.
     */
    fail(key: string): number | null;
    /**
     * Forgets the failed attempts.
     * @param {string} key The key.
     */
    succeed(key: string): void;
    /**
     * Forgets all failed attempts.
     */
    clear(): void;
}
//# sourceMappingURL=Retries.d.ts.map