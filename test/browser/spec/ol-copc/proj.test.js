import {transform} from 'ol/proj.js';
import {register} from 'ol/proj/proj4.js';
import proj4 from 'proj4';
import {registerWkt} from '../../../../src/ol-copc/proj.js';

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

    it('registers WKT2 with alternative keywords in any case', function () {
      const wkt = COMPOUND_BOUND.replace('COMPOUNDCRS[', 'compoundCrs[')
        .replace('PROJCRS[', 'projectedCRS[')
        .replace('ELLIPSOID[', 'spheroid[')
        .replace('VERTCRS[', 'verticalCRS[');
      const projection = registerWkt(wkt);
      const [lon, lat] = transform([533000, 5929000], projection, 'EPSG:4326');
      expect(lon).to.be.within(9.49, 9.51);
      expect(lat).to.be.within(53.5, 53.52);
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
      expect(registerWkt(COMPOUND)).to.equal(registerWkt(` ${COMPOUND} `));
    });
  });
});
