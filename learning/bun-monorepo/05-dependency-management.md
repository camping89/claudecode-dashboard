# Dependency Management

## Dependency Types

### dependencies
Runtime requirements. Shipped with production code.
```json
{
  "dependencies": {
    "hono": "^4.0.0"
  }
}
```

### devDependencies
Build/test only. Not in production.
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### peerDependencies
Consumer must provide. Prevents duplicates.
```json
{
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

**Use case:** UI library that needs React but shouldn't bundle its own.

### optionalDependencies
Nice to have. Install continues if fails.
```json
{
  "optionalDependencies": {
    "fsevents": "^2.0.0"
  }
}
```

## Where to Install?

| Scenario | Location |
|----------|----------|
| Used by one package | That package |
| Used by multiple packages | Root |
| Shared tooling (ESLint, TS) | Root devDeps |
| Runtime for specific app | That app |

## Installing Dependencies

```bash
# Add to specific workspace
bun add hono --cwd apps/api

# Add dev dep to root
bun add -D typescript

# Add to root for all workspaces
bun add react

# Add workspace dependency
bun add @cc/types --cwd apps/web
```

## Workspace Protocol

```json
{
  "dependencies": {
    "@cc/types": "workspace:*"
  }
}
```

**Versions:**
- `workspace:*` - Any version (most common)
- `workspace:^1.0.0` - Semver compatible
- `workspace:~` - Exact version match

## Version Alignment

Keep versions consistent across workspaces.

### Manual
Check all package.json files.

### Automated with syncpack
```bash
bunx syncpack list-mismatches
bunx syncpack fix-mismatches
```

### With renovate/dependabot
Automated PRs for updates.

## Hoisting Behavior

Bun hoists to root `node_modules`:
```
node_modules/
├── react/          # Hoisted (shared)
├── typescript/     # Hoisted
└── @cc/
    ├── types/      # Symlink to packages/types
    └── ui/         # Symlink to packages/ui
```

**Isolated packages** keep their own node_modules:
```
packages/special/
├── node_modules/
│   └── private-dep/  # Not hoisted
└── package.json
```

## Dependency Graph

Visualize dependencies:
```bash
# With turbo
bunx turbo run build --graph

# Output to file
bunx turbo run build --graph=graph.png
```

## Common Issues

### 1. Version Mismatch
```
apps/web has react@18.2.0
apps/api has react@18.1.0
```
**Fix:** Use same version or syncpack.

### 2. Phantom Dependencies
Using package not in your dependencies (hoisted from elsewhere).
```typescript
// ❌ Works but wrong
import foo from "some-package"; // Not in package.json!
```
**Fix:** Explicitly add to dependencies.

### 3. Duplicate Packages
Multiple versions installed.
```bash
# Check for duplicates
bun pm ls react
```

### 4. Circular Dependencies
```
A -> B -> C -> A  // 💥
```
**Fix:** Extract shared code or restructure.

## Best Practices

1. **Pin dev tools** at root level
2. **Use workspace:*** for internal packages
3. **Prefer peerDeps** for UI libraries
4. **Run `bun install`** after any package.json change
5. **Commit lockfile** (`bun.lockb`)

## Lockfile

`bun.lockb` - binary lockfile at root.

**Contains:**
- Exact versions of all deps
- Integrity hashes
- Resolution metadata

**Rules:**
- Always commit
- Never edit manually
- Regenerate with `bun install`

## Exercise

1. List all dependencies:
```bash
bun pm ls
```

2. Check for version mismatches:
```bash
bunx syncpack list-mismatches
```

3. Add a new dependency:
```bash
bun add lodash --cwd packages/utils
# Check it appears in packages/utils/package.json
```
