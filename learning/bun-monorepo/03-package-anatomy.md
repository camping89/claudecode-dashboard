# Package Anatomy

## Minimal Package Structure

```
packages/my-package/
├── package.json     # Metadata + exports
├── src/
│   └── index.ts     # Entry point
└── tsconfig.json    # TypeScript config
```

## package.json Deep Dive

```json
{
  "name": "@cc/my-package",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### Field Breakdown

| Field | Purpose |
|-------|---------|
| `name` | Unique identifier, scoped with `@org/` |
| `version` | Semver for internal tracking |
| `type` | `"module"` = ESM, omit = CommonJS |
| `exports` | Define public API surface |
| `scripts` | Package-specific commands |
| `dependencies` | Runtime requirements |
| `devDependencies` | Build/test only |

## The `exports` Field

Modern replacement for `main` field. Controls what consumers can import.

### Single Entry Point
```json
{
  "exports": "./src/index.ts"
}
```

### Multiple Entry Points
```json
{
  "exports": {
    ".": "./src/index.ts",
    "./utils": "./src/utils/index.ts",
    "./types": "./src/types/index.ts"
  }
}
```

Consumer usage:
```typescript
import { foo } from "@cc/my-package";        // from "."
import { bar } from "@cc/my-package/utils";  // from "./utils"
```

### Conditional Exports
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",  // TypeScript
      "import": "./dist/index.mjs",   // ESM
      "require": "./dist/index.cjs"   // CommonJS
    }
  }
}
```

## Types Package Pattern

For shared TypeScript types:

```
packages/types/
├── package.json
└── src/
    ├── index.ts       # Re-exports all
    ├── user.ts        # User types
    ├── api.ts         # API types
    └── config.ts      # Config types
```

```typescript
// src/index.ts
export * from "./user";
export * from "./api";
export * from "./config";
```

**Why separate types package?**
- Shared across frontend + backend
- No runtime code = zero bundle size
- Single source of truth

## UI Package Pattern

For shared components:

```
packages/ui/
├── package.json
├── src/
│   ├── index.ts
│   ├── button.tsx
│   └── input.tsx
└── tsconfig.json
```

```json
// package.json
{
  "name": "@cc/ui",
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

**peerDependencies**: Consumer must provide these. Prevents duplicate React.

## Config Package Pattern

Shared configs (ESLint, TypeScript, Tailwind):

```
packages/config/
├── package.json
├── eslint.config.js
├── tsconfig.base.json
└── tailwind.preset.js
```

Consumer extends:
```json
// apps/web/tsconfig.json
{
  "extends": "@cc/config/tsconfig.base.json"
}
```

## Build vs No-Build

### No-Build (Recommended for Bun)
- Bun runs TypeScript directly
- Just point exports to `.ts` files
- Faster development cycle

```json
{
  "exports": "./src/index.ts"
}
```

### With Build (For npm publish)
- Compile to JavaScript
- Generate `.d.ts` for types
- Required for external consumers

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

## Exercise

1. Examine a package in your project:
```bash
cat packages/types/package.json
```

2. Check what's exported:
```bash
cat packages/types/src/index.ts
```

3. Trace a type from package to app:
   - Find a type in `packages/types`
   - Find where it's imported in `apps/`
