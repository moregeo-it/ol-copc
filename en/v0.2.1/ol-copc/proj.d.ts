/**
 * Returns the horizontal part of a compound coordinate reference system,
 * as proj4 can't parse compound reference systems.
 * @param {string} wkt WKT1 (OGC 01-009) or WKT2 (ISO 19162)
 * @return {string} The horizontal reference system.
 */
export function getHorizontalWkt(wkt: string): string;
/**
 * Converts a WKT to the form that proj4 can parse: brackets as delimiters and,
 * for WKT2, the preferred keywords in upper case. Quoted text is kept as it is.
 * @param {string} wkt WKT1 (OGC 01-009) or WKT2 (ISO 19162)
 * @return {string} The normalized WKT.
 */
export function normalizeWkt(wkt: string): string;
/**
 * Registers the horizontal reference system of a WKT with proj4 and OpenLayers.
 * @param {string} wkt WKT1 (OGC 01-009) or WKT2 (ISO 19162)
 * @return {import("ol/proj/Projection.js").default} The projection.
 */
export function registerWkt(wkt: string): import("ol/proj/Projection.js").default;
/**
 * A keyword of a WKT with its position and the nested keywords.
 */
export type WktNode = {
    /**
     * The keyword, in upper case for WKT2.
     */
    keyword: string;
    /**
     * The index of the keyword.
     */
    start: number;
    /**
     * The index after the right delimiter.
     */
    end: number;
    /**
     * The nested keywords.
     */
    children: Array<WktNode>;
};
export type ParsedWkt = {
    /**
     * The outermost keyword.
     */
    root: WktNode;
    /**
     * Whether it is WKT1 (OGC 01-009) instead of WKT2 (ISO 19162).
     */
    wkt1: boolean;
    /**
     * All keywords in their order.
     */
    keywords: Array<WktNode>;
    /**
     * The indices of all delimiters.
     */
    delimiters: Array<number>;
};
//# sourceMappingURL=proj.d.ts.map