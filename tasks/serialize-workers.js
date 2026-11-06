import esMain from 'es-main';
import fse from 'fs-extra';
import {createRequire} from 'module';
import path, {dirname} from 'path';
import {rolldown} from 'rolldown';
import {fileURLToPath} from 'url';

const require = createRequire(import.meta.url);
const baseDir = dirname(fileURLToPath(import.meta.url));
const workerDir = path.resolve(baseDir, '../src/ol-copc/worker');
const buildDir = path.resolve(baseDir, '../build/ol-copc/worker');

/**
 * The virtual module that provides the WebAssembly of the LAZ decompressor
 * (laz-perf) as base64, see `types/laz-perf-wasm.d.ts`.
 */
const LAZ_PERF_WASM = 'virtual:laz-perf-wasm';

/**
 * Provides the virtual module with the WebAssembly of the LAZ decompressor.
 * @return {import('rolldown').Plugin} The plugin, also usable with Vite.
 */
export function lazPerfWasm() {
  return {
    name: 'laz-perf-wasm',
    resolveId(id) {
      return id === LAZ_PERF_WASM ? `\0${LAZ_PERF_WASM}` : null;
    },
    load(id) {
      if (id !== `\0${LAZ_PERF_WASM}`) {
        return null;
      }
      const wasm = fse.readFileSync(
        require.resolve('laz-perf/lib/web/laz-perf.wasm'),
      );
      return `export default ${JSON.stringify(wasm.toString('base64'))};`;
    },
  };
}

/**
 * Bundles a worker into a module that exports a `create` function, which
 * creates the worker from the inlined source (same approach as OpenLayers).
 * @param {string} input The worker module.
 * @param {{minify?: boolean}} [options] Options.
 * @return {Promise<string>} The module code.
 */
export async function build(input, {minify = true} = {}) {
  const bundle = await rolldown({
    input,
    platform: 'browser',
    plugins: [
      {
        name: 'remove export let create',
        transform(code, id) {
          if (path.resolve(id) !== path.resolve(input)) {
            return null;
          }
          return code.replace(
            '/** @type {function(): Worker} */ export let create;',
            '',
          );
        },
      },
      lazPerfWasm(),
    ],
  });
  const {output} = await bundle.generate({format: 'iife', minify});
  await bundle.close();
  if (output.length !== 1) {
    throw new Error(`Unexpected output length: ${output.length}`);
  }
  // One blob URL for all workers, so that it doesn't need to be revoked
  return `let url;

export function create() {
  if (!url) {
    const source = ${JSON.stringify(output[0].code)};
    url = URL.createObjectURL(
      new Blob([source], {type: 'application/javascript'}),
    );
  }
  return new Worker(url);
}
`;
}

/**
 * Replaces the workers in the build with their serialized versions.
 */
async function main() {
  await fse.ensureDir(buildDir);
  for (const entry of await fse.readdir(workerDir)) {
    if (!entry.endsWith('.js')) {
      continue;
    }
    const code = await build(path.join(workerDir, entry));
    await fse.writeFile(path.join(buildDir, entry), code);
    await fse.remove(path.join(buildDir, `${entry}.map`));
  }
}

if (esMain(import.meta)) {
  main().catch((err) => {
    process.stderr.write(`${err.stack}\n`);
    process.exit(1);
  });
}
