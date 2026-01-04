# Phase 1: Cleanup & Project Setup

**Status:** DONE (2026-01-04 10:27)
**Estimated Files:** 5
**Review:** plans/reports/code-reviewer-260104-1019-phase-01-review.md

---

## Objective

Remove web/api apps, flatten structure, set up Ink + React project.

---

## Tasks

### 1.1 Remove Web Stack
```bash
rm -rf apps/
rm turbo.json
rm bun.lock
```

### 1.2 Move Packages to src/lib
```bash
mkdir -p src/lib
mv packages/config-reader/src/* src/lib/config-reader/
mv packages/types/src/index.ts src/lib/types.ts
rm -rf packages/
```

### 1.3 Update package.json

Replace root `package.json`:

```json
{
  "name": "cc-dashboard",
  "version": "1.0.0",
  "description": "CLI dashboard for viewing Claude Code configurations",
  "type": "module",
  "bin": {
    "cc-dashboard": "./dist/cli.js"
  },
  "files": ["dist"],
  "scripts": {
    "dev": "tsx src/cli.tsx",
    "build": "tsup",
    "build:bun": "bun build src/cli.tsx --compile --outfile dist/cc-dashboard",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "ink": "^5.0.0",
    "@inkjs/ui": "^2.0.0",
    "react": "^18.3.0",
    "commander": "^12.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/node": "^22.0.0",
    "tsup": "^8.0.0",
    "tsx": "^4.0.0",
    "typescript": "^5.7.0"
  },
  "engines": {
    "node": ">=20"
  },
  "keywords": ["claude", "cli", "dashboard", "tui", "config"],
  "license": "MIT"
}
```

### 1.4 Update tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.5 Create tsup.config.ts

```typescript
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
  external: [],
  noExternal: [/.*/],
  treeshake: true,
})
```

### 1.6 Update Internal Imports

In `src/lib/config-reader/readers/*.ts`:
- Change `import type { X } from '@cc/types'` → `import type { X } from '../../types'`
- Change `import { CLAUDE_PATHS } from '../paths'` → keep as is (relative)

In `src/lib/config-reader/index.ts`:
- Keep exports as is

---

## Validation

```bash
# After cleanup
ls src/lib/
# Should show: config-reader/ types.ts

# Install deps
bun install

# Type check
bun run type-check
```

---

## Review Results

**Date:** 2026-01-04 10:19
**Status:** ⚠️ BLOCKED
**Blocker:** Missing `src/cli.tsx` - build and dev scripts fail

### Completed Tasks
✅ 1.1 Web stack removed (apps/, turbo.json, bun.lock)
✅ 1.2 Packages moved to src/lib/
✅ 1.3 package.json updated
✅ 1.4 tsconfig.json updated
✅ 1.5 tsup.config.ts created
✅ 1.6 Imports updated (.js extensions)
✅ Type-check passes

### Critical Issues
- **C1:** Missing src/cli.tsx prevents build
- **H1:** Empty catch blocks swallow errors
- **H2:** moduleResolution: bundler may break

### Next Steps
1. Create src/cli.tsx stub OR defer to Phase 2
2. Add error logging to readers
3. Fix moduleResolution to "node16"

Full report: plans/reports/code-reviewer-260104-1019-phase-01-review.md

---

## Files Changed

| File | Action | Status |
|------|--------|--------|
| `apps/` | DELETE | ✅ |
| `packages/` | DELETE | ✅ |
| `turbo.json` | DELETE | ✅ |
| `package.json` | REPLACE | ✅ |
| `tsconfig.json` | REPLACE | ✅ |
| `tsup.config.ts` | CREATE | ✅ |
| `src/lib/config-reader/*` | MOVE | ✅ |
| `src/lib/types.ts` | MOVE | ✅ |
| `src/cli.tsx` | CREATE | ❌ MISSING |
