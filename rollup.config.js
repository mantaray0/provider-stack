import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

const banner = "'use client';";

export default [
  // ESM and CJS builds
  {
    input: 'src/index.tsx',
    output: [
      {
        file: 'dist/index.mjs',
        format: 'esm',
        banner,
        sourcemap: true,
      },
      {
        file: 'dist/index.js',
        format: 'cjs',
        banner,
        sourcemap: true,
      },
    ],
    external: ['react'],
    plugins: [
      resolve(),
      typescript({
        tsconfig: './tsconfig.build.json',
        declaration: false,
      }),
    ],
  },
  // Type declarations
  {
    input: 'src/index.tsx',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm',
    },
    external: ['react'],
    plugins: [dts()],
  },
];
