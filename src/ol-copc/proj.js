/**
 * @module ol-copc/proj
 */
import {get as getProjection} from 'ol/proj.js';
import {register} from 'ol/proj/proj4.js';
import proj4 from 'proj4';

/**
 * Registers a WKT with proj4 and OpenLayers.
 * For compound reference systems, proj4 uses the horizontal reference system.
 * @param {string} wkt WKT1 (OGC 01-009) or WKT2 (ISO 19162)
 * @return {import("ol/proj/Projection.js").default} The projection.
 */
export function registerWkt(wkt) {
  wkt = wkt.trim();
  // btoa only supports Latin-1
  const bytes = new TextEncoder().encode(wkt);
  const code = `COPC:${btoa(String.fromCharCode(...bytes))}`;
  if (!proj4.defs(code)) {
    // proj4 keeps definitions it can't parse, which breaks registering other projections
    try {
      proj4(wkt);
    } catch (error) {
      throw new Error(
        `Unsupported coordinate reference system: ${error?.message ?? error}`,
      );
    }
    proj4.defs(code, wkt);
    register(proj4);
  }
  return getProjection(code);
}
