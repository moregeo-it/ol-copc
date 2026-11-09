# ol-copc

Cloud Optimized Point Clouds (COPC) for OpenLayers, released under the [Apache 2.0 license](LICENSE.md).

![Test Status](https://github.com/moregeo-it/ol-copc/workflows/Test/badge.svg)

The points are rendered with WebGL 2, top-down or in a tilted view that shows buildings and terrain in 3D
and follows the rotation of the map. Only the points needed for the current view are loaded,
so even point clouds with hundreds of millions of points can be shown.
The points can be colored by RGB, classification, elevation or intensity.

## Getting Started

Please read the Quick Start first:
<https://ol-copc.moregeo.it/doc/quickstart.html>

Explore the examples to get started with some more code:
<https://ol-copc.moregeo.it/en/latest/examples/>

Dig into the API documentation for all details:
<https://ol-copc.moregeo.it/en/latest/apidoc/>

```js
import {COPCLayer, COPCSource} from 'ol-copc';

const layer = new COPCLayer({
  source: new COPCSource({url: 'https://example.com/path/to/points.copc.laz'}),
  tilt: 45,
});
```

### Requirements

- OpenLayers >= 9.0.0, proj4 and WebGL 2.
- The server must support HTTP range requests and CORS.
- The projection of the point cloud and of the map must be registered with proj4 (`register(proj4)`).
- The points are decompressed in web workers that are created from `blob:` URLs, as in OpenLayers.
  If you use a Content Security Policy, allow them with `worker-src blob:`.

## STAC

To show point clouds from STAC catalogs and APIs, use [ol-stac](https://github.com/moregeo-it/ol-stac),
which uses ol-copc for COPC assets.

## TypeScript support

The [ol-copc package](https://npmjs.com/package/ol-copc) includes auto-generated TypeScript declarations as `*.d.ts` files.

## Bugs

Please use the [GitHub issue tracker](https://github.com/moregeo-it/ol-copc/issues) for all bugs and feature requests. Before creating a new issue, do a quick search to see if the problem has been reported already.

## Related work

- [copc.js](https://github.com/connormanning/copc.js) reads COPC files, ol-copc uses it.
- The [COPC viewer](https://viewer.copc.io) by Hobu, Inc. shows COPC files in 3D.
