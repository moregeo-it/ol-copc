/**
 * Returns the horizontal part of a compound coordinate reference system,
 * as proj4 can't parse compound reference systems.
 * @param {string} wkt WKT1 or WKT2
 * @return {string} The horizontal reference system.
 */
export function getHorizontalWkt(wkt: string): string;
/**
 * Converts a WKT to the form proj4 can parse: keywords in upper case and in their
 * short form, with brackets as delimiters. Quoted strings are kept as they are.
 * @param {string} wkt WKT1 or WKT2
 * @return {string} The normalized WKT.
 */
export function normalizeWkt(wkt: string): string;
/**
 * Registers the horizontal reference system of a WKT with proj4 and OpenLayers.
 * @param {string} wkt WKT1 or WKT2
 * @return {import("ol/proj/Projection.js").default} The projection.
 */
export function registerWkt(wkt: string): import("ol/proj/Projection.js").default;
//# sourceMappingURL=proj.d.ts.map