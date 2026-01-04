import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/cli.tsx'],
  format: ['esm'],
  target: 'node20',
  clean: true,
  dts: false,
  sourcemap: false,
  minify: true,
  banner: {
    js: '#!/usr/bin/env node'
  },
  external: ['react-devtools-core'],
  noExternal: [/^(?!react-devtools-core).*/],
  treeshake: true,
})
