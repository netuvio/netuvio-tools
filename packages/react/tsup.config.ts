import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
  },
  clean: true,
  sourcemap: true,
  target: 'es2022',
  noExternal: [/^@netuvio\//],
  banner: {
    js: '"use client";',
  },
  esbuildOptions(options) {
    options.loader = {
      ...options.loader,
      '.module.css': 'local-css',
    };
  },
});
