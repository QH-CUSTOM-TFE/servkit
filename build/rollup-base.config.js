import buble from '@rollup/plugin-buble';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import rollupTypescript from 'rollup-plugin-typescript2';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import { join } from 'path';
import fs from 'fs';

export function createEntries(config) {
  return config.map((c) => {
    return createEntry(c);
  });
}

function createEntry(config) {

  const pkg = JSON.parse(fs.readFileSync(join(__dirname, '../package.json'), {encoding: 'utf8'}));

  const c = {
    input: config.input,
    plugins: [
      rollupTypescript({
        tsconfig: 'src/tsconfig.json',
        tsconfigOverride: {
          compilerOptions: {
            "module": "es6",
          }
        }
      }),
      json(),
      copy({
        targets: [
          {
            src: 'package.json',
            dest: 'dist',
            transform(contents) {
              return JSON.stringify({
                ...JSON.parse(contents),
                "main": "index.common.js",
                "unpkg": "index.js",
                "jsdelivr": "index.js",
                "module": "index.esm.js",
                "typings": "index.d.ts",
              }, null, 2)
            }
          },
          {
            src: 'README.md',
            dest: 'dist'
          }
        ]
      }),
    ],
    output: {
      banner: `/*!
 * servkit QH-CUSTOM-TFE ${pkg.version}
 * (c) ${new Date().getFullYear()} QH-CUSTOM-TFE
 * @license MIT
 */`,
      file: `dist/${config.file}`,
      format: config.format,
      globals: {},
      sourcemap: true,
    },
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg);
      }
    },
    external: {}
  };

  if (config.format === 'umd') {
    c.output.name = c.output.name || 'servkit';
  }

  c.plugins.push(
    replace({
      __VERSION__: pkg.version,
      __DEV__:
        config.format !== 'umd' && !config.browser
          ? "(process.env.NODE_ENV !== 'production')"
          : config.env !== 'production',
    })
  );

  if (config.transpile !== false) {
    c.plugins.push(
      buble({
        transforms: { generator: false }
      })
    );
  }

  c.plugins.push(
    resolve({
      preferBuiltins: false,
      extensions: ['.ts', '.tsx', '.js', '.mjs']
    })
  );
  c.plugins.push(
    commonjs({
      transformMixedEsModules: true,
      extensions: ['.ts', '.tsx', '.js'],
    })
  );

  if (config.minify) {
    c.plugins.push(terser({ module: config.format === 'es' }));
  }

  return c;
}
