---
title: Quick Start
layout: default.hbs
---

# Quick Start

To use OL COPC in your application, add it as a dependency:
```bash
npm install ol-copc
```

The projection of the point cloud is read from the file and registered with proj4, so proj4 needs to be registered with OpenLayers:
```js
import {register} from 'ol/proj/proj4.js';
import proj4 from 'proj4';

register(proj4);
```

Then create a source for the COPC file and a layer to render it.
I'm assuming your OpenLayers map variable is named `map`.
```js
import {COPCLayer, COPCSource} from 'ol-copc';

const source = new COPCSource({
  url: 'https://example.com/path/to/points.copc.laz',
});
const layer = new COPCLayer({
  source,
  tilt: 45,
});
map.addLayer(layer);
```

The server must support HTTP range requests and CORS.
The points are decompressed in web workers that are created from `blob:` URLs, so if you use a Content Security Policy, allow them with `worker-src blob:`.

For full code examples, please see the **[examples](/en/latest/examples/)**.
