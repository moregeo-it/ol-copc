import Map from 'ol/Map.js';
import View from 'ol/View.js';
import Control from 'ol/control/Control.js';
import TileLayer from 'ol/layer/Tile.js';
import {transformExtent} from 'ol/proj.js';
import {register} from 'ol/proj/proj4.js';
import OSM from 'ol/source/OSM.js';
import proj4 from 'proj4';
import {COPCLayer, COPCSource} from '../src/ol-copc/index.js';

register(proj4); // required to read the projection of the point clouds

const datasets = {
  autzen: {
    url: 'https://s3.amazonaws.com/hobu-lidar/autzen-classified.copc.laz',
    colorMode: 'rgb',
  },
  sofi: {
    url: 'https://s3.amazonaws.com/hobu-lidar/sofi.copc.laz',
    colorMode: 'elevation',
  },
};

const tilt = /** @type {HTMLInputElement} */ (document.getElementById('tilt'));
const dataset = /** @type {HTMLSelectElement} */ (
  document.getElementById('dataset')
);
const color = /** @type {HTMLSelectElement} */ (
  document.getElementById('color')
);
const edl = /** @type {HTMLInputElement} */ (document.getElementById('edl'));
const walls = /** @type {HTMLInputElement} */ (
  document.getElementById('walls')
);
const noise = /** @type {HTMLInputElement} */ (
  document.getElementById('noise')
);

const map = new Map({
  target: 'map',
  layers: [new TileLayer({source: new OSM()})],
  view: new View({center: [0, 0], zoom: 2}),
});
map.addControl(
  new Control({element: document.getElementById('view-controls')}),
);

/** @type {COPCLayer|null} */
let pointCloud = null;

function showDataset() {
  if (pointCloud) {
    map.removeLayer(pointCloud);
    // Disposing the source terminates its workers
    pointCloud.getSource().dispose();
    pointCloud.dispose();
  }
  const {url, colorMode} = datasets[dataset.value];
  color.value = colorMode;
  const source = new COPCSource({
    url,
    attributions: 'Point cloud: <a href="https://hobu.co">Hobu, Inc.</a>',
  });
  pointCloud = new COPCLayer({
    source,
    tilt: Number(tilt.value),
    colorMode: /** @type {*} */ (colorMode),
    edl: Number(edl.value),
    walls: walls.checked,
    hideNoise: noise.checked,
  });
  map.addLayer(pointCloud);

  const fit = () => {
    if (source.getState() !== 'ready') {
      return;
    }
    source.un('change', fit);
    const {min, max} = source.getMetadata().header;
    const view = map.getView();
    view.fit(
      transformExtent(
        [min[0], min[1], max[0], max[1]],
        source.getProjection(),
        view.getProjection(),
      ),
    );
  };
  source.on('change', fit);
}
showDataset();

dataset.addEventListener('change', showDataset);
color.addEventListener('change', () =>
  pointCloud.setColorMode(/** @type {*} */ (color.value)),
);
tilt.addEventListener('input', () => {
  document.getElementById('tilt-value').textContent = `${tilt.value}°`;
  pointCloud.setTilt(Number(tilt.value));
});
edl.addEventListener('input', () => pointCloud.setEDL(Number(edl.value)));
walls.addEventListener('change', () => pointCloud.setWalls(walls.checked));
noise.addEventListener('change', () => pointCloud.setHideNoise(noise.checked));

const rotate = (delta) => {
  const view = map.getView();
  view.animate({rotation: view.getRotation() + delta, duration: 300});
};
document
  .getElementById('rotate-left')
  .addEventListener('click', () => rotate(-Math.PI / 4));
document
  .getElementById('rotate-right')
  .addEventListener('click', () => rotate(Math.PI / 4));
