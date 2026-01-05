import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/cli.tsx'],
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  clean: true,
  dts: false,
  sourcemap: false,
  minify: true,
  splitting: false,
  banner: {
    js: '#!/usr/bin/env node'
  },
  external: ['react-devtools-core'],
  treeshake: true,
})
