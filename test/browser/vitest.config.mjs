import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';
import serializeWorkers from '../../tasks/vite-plugin-worker.js';

export default defineConfig({
  plugins: [serializeWorkers()],
  test: {
    include: ['test/browser/spec/**/*.test.js'],
    globals: true,
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{browser: 'chromium'}],
    },
  },
});
