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
    if (!/^(COMPD_CS|COMPOUNDCRS)\s*\[/i.test(wkt)) {
        return wkt;
    }
    // Not within other keywords such as BASEGEOGCRS
    const match = /(?<![A-Z_])(PROJCS|PROJCRS|PROJECTEDCRS|GEOGCS|GEOGCRS|GEOGRAPHICCRS|GEODCRS|GEODETICCRS)\s*\[/i.exec(wkt.substring(1));
    if (!match) {
        return wkt;
    }
    const start = match.index + 1;
    let depth = 0;
    for (let i = start; i < wkt.length; i++) {
        if (wkt[i] === '[') {
            depth++;
        }
        else if (wkt[i] === ']' && --depth === 0) {
            return wkt.substring(start, i + 1);
        }
    }
    return wkt;
}
/**
 * Registers the horizontal reference system of a WKT with proj4 and OpenLayers.
 * @param {string} wkt WKT1 or WKT2
 * @return {import("ol/proj/Projection.js").default} The projection.
 */
export function registerWkt(wkt) {
    const horizontal = getHorizontalWkt(wkt);
    const code = `COPC:${btoa(horizontal)}`;
    if (!proj4.defs(code)) {
        proj4.defs(code, horizontal);
        register(proj4);
    }
    return getProjection(code);
}
//# sourceMappingURL=proj.js.map