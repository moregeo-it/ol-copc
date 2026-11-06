import path, {dirname} from 'path';
import {fileURLToPath} from 'url';
import {build, lazPerfWasm} from './serialize-workers.js';

const workerDir = path.resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/ol-copc/worker',
);

/**
 * Serializes the workers for the examples and tests, as `serialize-workers.js` does for the build.
 * @return {Array<import('vite').Plugin>} The plugins.
 */
export default function serializeWorkers() {
  return [
    {
      name: 'ol-copc-serialize-workers',
      enforce: 'pre',
      async transform(code, id) {
        // Vite ids use forward slashes, normalize them for Windows
        const file = path.normalize(id.split('?')[0]);
        if (!file.startsWith(workerDir + path.sep) || !file.endsWith('.js')) {
          return null;
        }
        return {code: await build(file, {minify: false}), map: null};
      },
    },
    // Vite's dependency scan reads the worker before it is serialized
    /** @type {import('vite').Plugin} */ (lazPerfWasm()),
  ];
}
