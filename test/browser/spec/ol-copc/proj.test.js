import {transform} from 'ol/proj.js';
import {register} from 'ol/proj/proj4.js';
import proj4 from 'proj4';
import {
  getHorizontalWkt,
  normalizeWkt,
  registerWkt,
} from '../../../../src/ol-copc/proj.js';

const WKT_25832 =
  'PROJCS["ETRS89 / UTM zone 32N",GEOGCS["ETRS89",DATUM["European_Terrestrial_Reference_System_1989",SPHEROID["GRS 1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",9],PARAMETER["scale_factor",0.9996],PARAMETER["false_easting",500000],PARAMETER["false_northing",0],UNIT["metre",1]]';

const COMPOUND = `COMPD_CS["ETRS89 / UTM zone 32N + DHHN2016 height",${WKT_25832},VERT_CS["DHHN2016 height",VERT_DATUM["Deutsches Haupthoehennetz 2016",2005],UNIT["metre",1]]]`;

const WKT2_25832 =
  'PROJCRS["ETRS89 / UTM zone 32N",BASEGEOGCRS["ETRS89",DATUM["European Terrestrial Reference System 1989",ELLIPSOID["GRS 1980",6378137,298.257222101,LENGTHUNIT["metre",1]]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],ID["EPSG",4258]],CONVERSION["UTM zone 32N",METHOD["Transverse Mercator",ID["EPSG",9807]],PARAMETER["Latitude of natural origin",0,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8801]],PARAMETER["Longitude of natural origin",9,ANGLEUNIT["degree",0.0174532925199433],ID["EPSG",8802]],PARAMETER["Scale factor at natural origin",0.9996,SCALEUNIT["unity",1],ID["EPSG",8805]],PARAMETER["False easting",500000,LENGTHUNIT["metre",1],ID["EPSG",8806]],PARAMETER["False northing",0,LENGTHUNIT["metre",1],ID["EPSG",8807]]],CS[Cartesian,2],AXIS["easting",east,ORDER[1],LENGTHUNIT["metre",1]],AXIS["northing",north,ORDER[2],LENGTHUNIT["metre",1]],ID["EPSG",25832]]';

const VERTCRS =
  'VERTCRS["DHHN2016 height",VDATUM["Deutsches Haupthoehennetz 2016"],CS[vertical,1],AXIS["gravity-related height (H)",up,LENGTHUNIT["metre",1]]]';

// As written by PROJ 9.5 for a COMPD_CS with TOWGS84
const BOUND = `BOUNDCRS[SOURCECRS[${WKT2_25832}],TARGETCRS[GEOGCRS["WGS 84",DATUM["World Geodetic System 1984",ELLIPSOID["WGS 84",6378137,298.257223563,LENGTHUNIT["metre",1]]],PRIMEM["Greenwich",0,ANGLEUNIT["degree",0.0174532925199433]],CS[ellipsoidal,2],AXIS["latitude",north,ORDER[1],ANGLEUNIT["degree",0.0174532925199433]],AXIS["longitude",east,ORDER[2],ANGLEUNIT["degree",0.0174532925199433]],ID["EPSG",4326]]],ABRIDGEDTRANSFORMATION["Transformation from ETRS89 to WGS84",METHOD["Position Vector transformation (geog2D domain)",ID["EPSG",9606]],PARAMETER["X-axis translation",0,ID["EPSG",8605]],PARAMETER["Y-axis translation",0,ID["EPSG",8606]],PARAMETER["Z-axis translation",0,ID["EPSG",8607]],PARAMETER["X-axis rotation",0,ID["EPSG",8608]],PARAMETER["Y-axis rotation",0,ID["EPSG",8609]],PARAMETER["Z-axis rotation",0,ID["EPSG",8610]],PARAMETER["Scale difference",1,ID["EPSG",8611]]]]`;

const COMPOUND_BOUND = `COMPOUNDCRS["ETRS89 / UTM zone 32N + DHHN2016 height",${BOUND},${VERTCRS}]`;

describe('ol/proj', function () {
  describe('getHorizontalWkt', function () {
    it('returns the horizontal part of a compound WKT1', function () {
      expect(getHorizontalWkt(COMPOUND)).to.equal(WKT_25832);
    });

    it('returns the horizontal part of a compound WKT1 with parentheses', function () {
      const horizontal = WKT_25832.replaceAll('[', '(').replaceAll(']', ')');
      const wkt = COMPOUND.replaceAll('[', '(').replaceAll(']', ')');
      expect(getHorizontalWkt(wkt)).to.equal(horizontal);
    });

    it('ignores brackets and keywords in WKT1 names', function () {
      const horizontal = WKT_25832.replace(
        '"ETRS89 / UTM zone 32N"',
        '"Grid (0, 1000000] VERT_CS[ x"',
      );
      const wkt = `COMPD_CS["GEOGCS[ + height",${horizontal},VERT_CS["height",VERT_DATUM["d",2005],UNIT["metre",1]]]`;
      expect(getHorizontalWkt(wkt)).to.equal(horizontal);
    });

    it('returns the horizontal part of a compound WKT2', function () {
      const wkt = `COMPOUNDCRS["ETRS89 / UTM zone 32N + DHHN2016 height",${WKT2_25832},${VERTCRS}]`;
      expect(getHorizontalWkt(wkt)).to.equal(WKT2_25832);
    });

    it('returns the bound horizontal part of a compound WKT2 from PROJ', function () {
      expect(getHorizontalWkt(COMPOUND_BOUND)).to.equal(BOUND);
    });

    it('skips bound vertical parts of a compound WKT2', function () {
      const bound = `BOUNDCRS[SOURCECRS[${VERTCRS}],TARGETCRS[${VERTCRS}],ABRIDGEDTRANSFORMATION["t",METHOD["m"]]]`;
      const wkt = `COMPOUNDCRS["c",${bound},${WKT2_25832}]`;
      expect(getHorizontalWkt(wkt)).to.equal(WKT2_25832);
    });

    it('returns the geographic part of a compound WKT2:2015', function () {
      const horizontal =
        'GEODCRS["ETRS89",DATUM["European Terrestrial Reference System 1989",ELLIPSOID["GRS 1980",6378137,298.257222101]],CS[ellipsoidal,2],AXIS["latitude",north],AXIS["longitude",east],ANGLEUNIT["degree",0.0174532925199433]]';
      const wkt = `COMPOUNDCRS["ETRS89 + DHHN2016 height",${horizontal},${VERTCRS}]`;
      expect(getHorizontalWkt(wkt)).to.equal(horizontal);
    });

    it('supports the alternative WKT2 keywords in any case', function () {
      const horizontal = WKT2_25832.replace(
        'PROJCRS[',
        'projectedCRS[',
      ).replace('BASEGEOGCRS[', 'baseGeogCRS[');
      const wkt = `compoundCrs["c",${horizontal},${VERTCRS.replace('VERTCRS[', 'verticalCRS[')}]`;
      expect(getHorizontalWkt(wkt)).to.equal(horizontal);
    });

    it('supports parentheses and quotes in WKT2', function () {
      const horizontal = WKT2_25832.replace(
        '"ETRS89 / UTM zone 32N"',
        '"""Grid"" (0, 1000000] VERTCRS["',
      )
        .replaceAll('[', '(')
        .replaceAll(']', ')');
      const wkt = `COMPOUNDCRS("c",${horizontal},${VERTCRS.replaceAll('[', '(').replaceAll(']', ')')})`;
      expect(getHorizontalWkt(wkt)).to.equal(horizontal);
    });

    it('keeps other reference systems', function () {
      expect(getHorizontalWkt(` ${WKT_25832} `)).to.equal(WKT_25832);
      expect(getHorizontalWkt(WKT2_25832)).to.equal(WKT2_25832);
    });

    it('keeps WKT that is not structured as WKT1 or WKT2', function () {
      // ESRI WKT has no COMPD_CS, which LAS excludes
      const esri = `${WKT_25832},VERTCS["DHHN2016",VDATUM["DHHN2016"],UNIT["Meter",1.0]]`;
      expect(getHorizontalWkt(esri)).to.equal(esri);
      expect(getHorizontalWkt('COMPD_CS["a",PROJCS["b"]')).to.equal(
        'COMPD_CS["a",PROJCS["b"]',
      );
    });
  });

  describe('normalizeWkt', function () {
    it('keeps WKT that proj4 supports', function () {
      expect(normalizeWkt(WKT_25832)).to.equal(WKT_25832);
      expect(normalizeWkt(WKT2_25832)).to.equal(WKT2_25832);
    });

    it('converts parentheses to brackets', function () {
      expect(normalizeWkt('PROJCRS ("a",ID("EPSG",32632))')).to.equal(
        'PROJCRS ["a",ID["EPSG",32632]]',
      );
      expect(normalizeWkt('PROJCS("a",UNIT("metre",1))')).to.equal(
        'PROJCS["a",UNIT["metre",1]]',
      );
    });

    it('converts WKT2 keywords to their preferred form in upper case', function () {
      expect(
        normalizeWkt(
          'projectedCRS["a",baseGeogCRS["b",TRF["c",spheroid["d",1,2]],primeMeridian["e",0]],conversion["f",projection["g"]]]',
        ),
      ).to.equal(
        'PROJCRS["a",BASEGEOGCRS["b",DATUM["c",ELLIPSOID["d",1,2]],PRIMEM["e",0]],CONVERSION["f",METHOD["g"]]]',
      );
      expect(normalizeWkt('GEOGRAPHICCRS["a"]')).to.equal('GEOGCRS["a"]');
      expect(normalizeWkt('GEODETICCRS["a"]')).to.equal('GEODCRS["a"]');
    });

    it('keeps WKT1 keywords', function () {
      const wkt = 'PROJCS["a",GEOGCS["b",DATUM["c",SPHEROID["d",1,2]]]]';
      expect(normalizeWkt(wkt)).to.equal(wkt);
    });

    it('keeps quoted text', function () {
      const wkt = 'PROJCRS["projcrs(a) [b] ""c""",ID["EPSG",1]]';
      expect(normalizeWkt(wkt)).to.equal(wkt);
    });
  });

  describe('registerWkt', function () {
    beforeEach(function () {
      register(proj4);
    });

    it('registers the horizontal part of a compound WKT', function () {
      const projection = registerWkt(COMPOUND);
      expect(projection).to.be.ok;
      const [lon, lat] = transform([533000, 5929000], projection, 'EPSG:4326');
      expect(lon).to.be.within(9.49, 9.51);
      expect(lat).to.be.within(53.5, 53.52);
    });

    it('registers WKT2 with long keywords and parentheses', function () {
      const projection = registerWkt(
        'projectedcrs("WGS 84 / UTM zone 32N",basegeogcrs("WGS 84",datum("World Geodetic System 1984",ellipsoid("WGS 84",6378137,298.257223563))),conversion("UTM zone 32N",method("Transverse Mercator"),parameter("Latitude of natural origin",0,angleunit("degree",0.0174532925199433)),parameter("Longitude of natural origin",9,angleunit("degree",0.0174532925199433)),parameter("Scale factor at natural origin",0.9996,scaleunit("unity",1)),parameter("False easting",500000,lengthunit("metre",1)),parameter("False northing",0,lengthunit("metre",1))),cs(Cartesian,2),axis("easting",east,lengthunit("metre",1)),axis("northing",north,lengthunit("metre",1)))',
      );
      const [lon, lat] = transform([500000, 0], projection, 'EPSG:4326');
      expect(lon).to.be.within(8.99, 9.01);
      expect(lat).to.be.within(-0.01, 0.01);
    });

    it('registers WKT with names in any script', function () {
      const projection = registerWkt(
        WKT_25832.replace('ETRS89 / UTM zone 32N', 'ETRS89 / UTM 32N 区域'),
      );
      const [lon] = transform([500000, 0], projection, 'EPSG:4326');
      expect(lon).to.be.within(8.99, 9.01);
    });

    it('registers a compound WKT2 with a bound horizontal part', function () {
      const projection = registerWkt(COMPOUND_BOUND);
      const [lon, lat] = transform([533000, 5929000], projection, 'EPSG:4326');
      expect(lon).to.be.within(9.49, 9.51);
      expect(lat).to.be.within(53.5, 53.52);
    });

    it('rejects WKT that proj4 can not parse without breaking other projections', function () {
      expect(() => registerWkt('PROJCRS["a"]')).to.throw(
        'Unsupported coordinate reference system',
      );
      const projection = registerWkt(WKT2_25832);
      const [lon] = transform([500000, 0], projection, 'EPSG:4326');
      expect(lon).to.be.within(8.99, 9.01);
    });

    it('returns the same projection for the same WKT', function () {
      expect(registerWkt(COMPOUND)).to.equal(registerWkt(WKT_25832));
    });
  });
});
