import { rollup } from 'rollup';
import dts from 'rollup-plugin-dts';
import nodeResolve from '@rollup/plugin-node-resolve';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dtsPath = path.resolve(__dirname, '../dist/index.d.ts');

async function buildDts() {
  const bundle = await rollup({
    input: dtsPath,
    plugins: [
      nodeResolve({
        extensions: ['.d.ts', '.ts', '.js'],
        mainFields: ['types', 'typings', 'module', 'main'],
        exportConditions: ['types'],
      }),
      dts({ respectExternal: true }),
    ],
    external: ['vue'],
  });

  await bundle.write({
    file: dtsPath,
    format: 'es',
  });
}

buildDts().catch((err) => {
  console.error(err);
  process.exit(1);
});
