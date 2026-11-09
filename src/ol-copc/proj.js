/**
 * @module ol-copc/proj
 */
import {get as getProjection} from 'ol/proj.js';
import {register} from 'ol/proj/proj4.js';
import proj4 from 'proj4';

/**
 * A keyword of a WKT with its position and the nested keywords.
 * @typedef {Object} WktNode
 * @property {string} keyword The keyword, in upper case for WKT2.
 * @property {number} start The index of the keyword.
 * @property {number} end The index after the right delimiter.
 * @property {Array<WktNode>} children The nested keywords.
 */

/**
 * @typedef {Object} ParsedWkt
 * @property {WktNode} root The outermost keyword.
 * @property {boolean} wkt1 Whether it is WKT1 (OGC 01-009) instead of WKT2 (ISO 19162).
 * @property {Array<WktNode>} keywords All keywords in their order.
 * @property {Array<number>} delimiters The indices of all delimiters.
 */

/**
 * The keywords that WKT1 starts with (ISO 19162:2019, B.8).
 * @type {Array<string>}
 */
const WKT1_KEYWORDS = [
  'COMPD_CS',
  'FITTED_CS',
  'GEOCCS',
  'GEOGCS',
  'LOCAL_CS',
  'PROJCS',
  'VERT_CS',
];

/**
 * The alternative WKT2 keywords (ISO 19162:2015 and 2019) and their preferred form,
 * as proj4 only supports the preferred forms.
 * @type {Object<string, string>}
 */
const WKT2_PREFERRED = {
  GEODETICCRS: 'GEODCRS',
  GEOGRAPHICCRS: 'GEOGCRS',
  PROJECTEDCRS: 'PROJCRS',
  GEODETICDATUM: 'DATUM',
  TRF: 'DATUM',
  SPHEROID: 'ELLIPSOID',
  PRIMEMERIDIAN: 'PRIMEM',
  PROJECTION: 'METHOD',
  VERTICALCRS: 'VERTCRS',
  VERTICALDATUM: 'VDATUM',
  VRF: 'VDATUM',
  ENGINEERINGCRS: 'ENGCRS',
  ENGINEERINGDATUM: 'EDATUM',
  PARAMETRICDATUM: 'PDATUM',
  TIMEDATUM: 'TDATUM',
  TEMPORALQUANTITY: 'TIMEUNIT',
};

/**
 * The horizontal reference systems of WKT2 (ISO 19162:2015, 16.1 and ISO 19111:2019, 9.3.2).
 * @type {Array<string>}
 */
const WKT2_HORIZONTAL = ['PROJCRS', 'GEOGCRS', 'GEODCRS'];

/**
 * Parses the structure of a WKT, i.e. the keywords and their delimiters.
 * @param {string} wkt WKT1 (OGC 01-009) or WKT2 (ISO 19162)
 * @return {ParsedWkt|null} The parsed WKT, or `null` if it is not a valid WKT.
 */
function parseWkt(wkt) {
  const first = /^\s*([A-Za-z]\w*)\s*[[(]/.exec(wkt);
  if (!first) {
    return null;
  }
  // WKT1 keywords are upper case, WKT2 keywords are case insensitive (ISO 19162, 6.5)
  const wkt1 = WKT1_KEYWORDS.includes(first[1]);
  const word = /[A-Za-z]\w*/y;
  const delimiter = /\s*[[(]/y;
  /** @type {Array<WktNode>} */
  const keywords = [];
  /** @type {Array<number>} */
  const delimiters = [];
  /** @type {Array<WktNode>} */
  const stack = [];
  let root = null;
  let i = 0;
  while (i < wkt.length) {
    const char = wkt[i];
    if (char === '"') {
      let end = wkt.indexOf('"', i + 1);
      // Only WKT2 has quotes in quoted text, as two quotes (ISO 19162, 6.3.5)
      while (!wkt1 && end !== -1 && wkt[end + 1] === '"') {
        end = wkt.indexOf('"', end + 2);
      }
      if (end === -1) {
        return null;
      }
      i = end + 1;
    } else if (/[A-Za-z]/.test(char)) {
      word.lastIndex = i;
      const name = word.exec(wkt)[0];
      delimiter.lastIndex = word.lastIndex;
      // Words without delimiter are enumerations, e.g. east
      if (!delimiter.test(wkt)) {
        i = word.lastIndex;
        continue;
      }
      /** @type {WktNode} */
      const node = {
        keyword: wkt1 ? name : name.toUpperCase(),
        start: i,
        end: -1,
        children: [],
      };
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(node);
      } else if (root) {
        return null;
      } else {
        root = node;
      }
      stack.push(node);
      keywords.push(node);
      delimiters.push(delimiter.lastIndex - 1);
      i = delimiter.lastIndex;
    } else if (char === ']' || char === ')') {
      if (stack.length === 0) {
        return null;
      }
      stack.pop().end = i + 1;
      delimiters.push(i);
      i++;
    } else if (char === '[' || char === '(') {
      return null;
    } else {
      i++;
    }
  }
  return root && stack.length === 0 ? {root, wkt1, keywords, delimiters} : null;
}

/**
 * @param {WktNode} node A WKT2 keyword.
 * @return {boolean} Whether it is a horizontal reference system.
 */
function isWkt2Horizontal(node) {
  // Not valid in a compound CRS (ISO 19162:2019, 15.1), but written by PROJ
  if (node.keyword === 'BOUNDCRS') {
    const source = node.children.find((child) => child.keyword === 'SOURCECRS');
    return (
      source?.children.length === 1 && isWkt2Horizontal(source.children[0])
    );
  }
  const keyword = WKT2_PREFERRED[node.keyword] || node.keyword;
  return WKT2_HORIZONTAL.includes(keyword);
}

/**
 * The horizontal coordinate systems of WKT1 (OGC 01-009, 7.2).
 * @type {Array<string>}
 */
const WKT1_HORIZONTAL = ['PROJCS', 'GEOGCS'];

/**
 * Returns the horizontal part of a compound coordinate reference system,
 * as proj4 can't parse compound reference systems.
 * @param {string} wkt WKT1 (OGC 01-009) or WKT2 (ISO 19162)
 * @return {string} The horizontal reference system.
 */
export function getHorizontalWkt(wkt) {
  wkt = wkt.trim();
  const parsed = parseWkt(wkt);
  if (!parsed) {
    return wkt;
  }
  const {root, wkt1} = parsed;
  let horizontal;
  if (wkt1 && root.keyword === 'COMPD_CS') {
    horizontal = root.children.find((child) =>
      WKT1_HORIZONTAL.includes(child.keyword),
    );
  } else if (!wkt1 && root.keyword === 'COMPOUNDCRS') {
    horizontal = root.children.find(isWkt2Horizontal);
  }
  return horizontal ? wkt.substring(horizontal.start, horizontal.end) : wkt;
}

/**
 * Converts a WKT to the form that proj4 can parse: brackets as delimiters and,
 * for WKT2, the preferred keywords in upper case. Quoted text is kept as it is.
 * @param {string} wkt WKT1 (OGC 01-009) or WKT2 (ISO 19162)
 * @return {string} The normalized WKT.
 */
export function normalizeWkt(wkt) {
  const parsed = parseWkt(wkt);
  if (!parsed) {
    return wkt;
  }
  const chars = wkt.split('');
  for (const index of parsed.delimiters) {
    if (chars[index] === '(') {
      chars[index] = '[';
    } else if (chars[index] === ')') {
      chars[index] = ']';
    }
  }
  if (!parsed.wkt1) {
    for (const node of parsed.keywords) {
      // Upper case keeps the length of the keyword
      chars[node.start] = WKT2_PREFERRED[node.keyword] || node.keyword;
      chars.fill('', node.start + 1, node.start + node.keyword.length);
    }
  }
  return chars.join('');
}

/**
 * Registers the horizontal reference system of a WKT with proj4 and OpenLayers.
 * @param {string} wkt WKT1 (OGC 01-009) or WKT2 (ISO 19162)
 * @return {import("ol/proj/Projection.js").default} The projection.
 */
export function registerWkt(wkt) {
  const horizontal = normalizeWkt(getHorizontalWkt(wkt));
  // btoa only supports Latin-1
  const bytes = new TextEncoder().encode(horizontal);
  const code = `COPC:${btoa(String.fromCharCode(...bytes))}`;
  if (!proj4.defs(code)) {
    // proj4 keeps definitions it can't parse, which breaks registering other projections
    try {
      proj4(horizontal);
    } catch (error) {
      throw new Error(
        `Unsupported coordinate reference system: ${error?.message ?? error}`,
      );
    }
    proj4.defs(code, horizontal);
    register(proj4);
  }
  return getProjection(code);
}
