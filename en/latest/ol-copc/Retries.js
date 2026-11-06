/**
 * @module ol-copc/Retries
 */
/**
 * The maximum number of attempts to load something.
 */
export const MAX_ATTEMPTS = 3;
/**
 * @classdesc
 * Keeps track of failed attempts to load something (e.g. octree nodes), so that
 * they are retried a limited number of times with an increasing delay.
 */
class Retries {
    constructor() {
        /**
         * @type {Map<string, {count: number, retryAt: number}>}
         * @private
         */
        this.failures_ = new Map();
    }
    /**
     * @param {string} key The key.
     * @return {boolean} Whether it can be (re)tried now.
     */
    canTry(key) {
        const failure = this.failures_.get(key);
        return (!failure ||
            (failure.count < MAX_ATTEMPTS && Date.now() >= failure.retryAt));
    }
    /**
     * Records a failed attempt.
     * @param {string} key The key.
     * @return {number|null} The delay until the next attempt in milliseconds,
     * or `null` if there are no attempts left.
     */
    fail(key) {
        var _a;
        const count = (((_a = this.failures_.get(key)) === null || _a === void 0 ? void 0 : _a.count) || 0) + 1;
        const delay = 1000 * Math.pow(2, count - 1);
        this.failures_.set(key, { count, retryAt: Date.now() + delay });
        return count < MAX_ATTEMPTS ? delay : null;
    }
    /**
     * Forgets the failed attempts.
     * @param {string} key The key.
     */
    succeed(key) {
        this.failures_.delete(key);
    }
    /**
     * Forgets all failed attempts.
     */
    clear() {
        this.failures_.clear();
    }
}
export default Retries;
//# sourceMappingURL=Retries.js.map