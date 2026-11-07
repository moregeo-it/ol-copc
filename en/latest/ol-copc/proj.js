/**
 * @module ol-copc/proj
 */
import { get as getProjection } from 'ol/proj.js';
import { register } from 'ol/proj/proj4.js';
import proj4 from 'proj4';
/**
 * Returns the horizontal part of a compound coordinate reference system,
 * as proj4 can't parse compound reference systems.
 * @param {string} wkt WKT1 or WKT2
 * @return {string} The horizontal reference system.
 */
export function getHorizontalWkt(wkt) {
    wkt = wkt.trim();
    // WKT allows parentheses instead of brackets as delimiters
    if (!/^(COMPD_CS|COMPOUNDCRS)\s*[[(]/i.test(wkt)) {
        return wkt;
    }
    const keyword = /(?<![A-Z_])(PROJCS|PROJCRS|PROJECTEDCRS|GEOGCS|GEOGCRS|GEOGRAPHICCRS|GEODCRS|GEODETICCRS)\s*[[(]/iy;
    let quoted = false;
    let depth = 0;
    let start = -1;
    for (let i = 0; i < wkt.length; i++) {
        const char = wkt[i];
        // Quotes within strings are doubled, which toggles twice
        if (char === '"') {
            quoted = !quoted;
        }
        else if (quoted) {
            continue;
        }
        else if (char === '[' || char === '(') {
            depth++;
        }
        else if (char === ']' || char === ')') {
            depth--;
            if (start !== -1 && depth === 1) {
                return wkt.substring(start, i + 1);
            }
        }
        else if (start === -1 && depth === 1) {
            // Only the components of the compound reference system
            keyword.lastIndex = i;
            if (keyword.test(wkt)) {
                start = i;
            }
        }
    }
    return wkt;
}
/**
 * The long WKT2 keywords for the reference systems, which proj4 doesn't support.
 * @type {Object<string, string>}
 */
const SHORT_KEYWORDS = {
    PROJECTEDCRS: 'PROJCRS',
    GEOGRAPHICCRS: 'GEOGCRS',
    GEODETICCRS: 'GEODCRS',
};
/**
 * Converts a WKT to the form proj4 can parse: keywords in upper case and in their
 * short form, with brackets as delimiters. Quoted strings are kept as they are.
 * @param {string} wkt WKT1 or WKT2
 * @return {string} The normalized WKT.
 */
export function normalizeWkt(wkt) {
    return wkt.replace(/"(?:[^"]|"")*"|([A-Z_]\w*)(\s*[[(])|\(|\)/gi, (match, keyword, delimiter) => {
        if (keyword) {
            const upper = keyword.toUpperCase();
            return (SHORT_KEYWORDS[upper] || upper) + delimiter.replace('(', '[');
        }
        if (match === '(') {
            return '[';
        }
        if (match === ')') {
            return ']';
        }
        return match;
    });
}
/**
 * Registers the horizontal reference system of a WKT with proj4 and OpenLayers.
 * @param {string} wkt WKT1 or WKT2
 * @return {import("ol/proj/Projection.js").default} The projection.
 */
export function registerWkt(wkt) {
    const horizontal = normalizeWkt(getHorizontalWkt(wkt));
    // btoa only supports Latin-1
    const bytes = new TextEncoder().encode(horizontal);
    const code = `COPC:${btoa(String.fromCharCode(...bytes))}`;
    if (!proj4.defs(code)) {
        proj4.defs(code, horizontal);
        register(proj4);
    }
    return getProjection(code);
}
//# sourceMappingURL=proj.js.map