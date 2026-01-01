# Bun Workspaces

## What Are Workspaces?

Workspaces = mechanism to manage multiple packages in one repository with a single `bun.lockb`.

## Enabling Workspaces

Root `package.json`:
```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

**Key points:**
- `private: true` - prevents accidental publish of root
- `workspaces` - glob patterns for package locations

## How Bun Resolves Workspaces

When you run `bun install`:

1. Scans all workspace directories
2. Links internal packages via symlinks in `node_modules`
3. Creates single `bun.lockb` at root
4. Hoists shared dependencies to root `node_modules`

```
node_modules/
├── @cc/types -> ../../packages/types  (symlink!)
├── @cc/ui -> ../../packages/ui        (symlink!)
├── react/                              (hoisted)
└── typescript/                         (hoisted)
```

## Referencing Internal Packages

In `apps/web/package.json`:
```json
{
  "dependencies": {
    "@cc/types": "workspace:*",
    "@cc/ui": "workspace:*"
  }
}
```

**Protocol options:**
- `workspace:*` - any version (recommended)
- `workspace:^1.0.0` - semver range
- `workspace:~` - matches package's version exactly

## Package Naming Convention

```json
// packages/types/package.json
{
  "name": "@cc/types",  // Scoped name
  "version": "0.0.1"
}
```

**Scoping (`@cc/`):**
- Groups related packages
- Prevents npm naming conflicts
- Indicates internal/organizational code

## Running Scripts Across Workspaces

```bash
# Run in specific workspace
bun run --cwd apps/web dev

# Run script in all workspaces (with turbo)
bunx turbo run build

# Filter specific workspaces
bunx turbo run test --filter=@cc/types
```

## Dependency Hoisting

Bun hoists shared deps to root:

```
Before:
apps/web/node_modules/react
apps/api/node_modules/react
packages/ui/node_modules/react

After (hoisted):
node_modules/react  (shared by all)
```

**Benefits:**
- Smaller `node_modules`
- Faster installs
- Guaranteed same version

## Common Gotchas

### 1. Forgetting `workspace:*` Protocol
```json
// ❌ Wrong - will try npm
"@cc/types": "^1.0.0"

// ✅ Correct - uses local
"@cc/types": "workspace:*"
```

### 2. Circular Dependencies
```
packages/a -> packages/b -> packages/a  // 💥 Breaks!
```
Solution: Extract shared code to third package.

### 3. Missing Exports
```json
// packages/types/package.json
{
  "exports": {
    ".": "./src/index.ts"  // Must define entry!
  }
}
```

## Exercise

1. Check your workspace config:
```bash
cat package.json | grep -A 5 workspaces
```

2. Verify symlinks:
```bash
ls -la node_modules/@cc/
```

3. Add a new package:
```bash
mkdir packages/new-pkg
echo '{"name":"@cc/new-pkg","version":"0.0.1"}' > packages/new-pkg/package.json
bun install
```
