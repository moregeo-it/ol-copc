/**
 * The WebAssembly of the LAZ decompressor (laz-perf) as base64,
 * provided when the worker is serialized (see `tasks/serialize-workers.js`).
 */
declare module 'virtual:laz-perf-wasm' {
  const wasm: string;
  export default wasm;
}
