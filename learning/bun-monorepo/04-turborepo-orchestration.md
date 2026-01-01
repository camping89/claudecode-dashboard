# Turborepo Orchestration

## What is Turborepo?

Build system for monorepos. Handles:
- Task scheduling & parallelization
- Intelligent caching
- Dependency-aware execution

**Not required for Bun workspaces** - but highly recommended for larger projects.

## Installation

```bash
bun add -D turbo
```

## Configuration: turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "typecheck": {}
  }
}
```

## Task Configuration

### dependsOn

Controls execution order.

```json
{
  "build": {
    "dependsOn": ["^build"]
  }
}
```

**Operators:**
- `^build` - Run `build` in dependencies FIRST
- `build` - Run `build` in same package first
- `$ENV_VAR` - Include env var in cache key

**Example dependency chain:**
```
apps/web depends on packages/ui depends on packages/types

turbo run build:
1. packages/types:build
2. packages/ui:build
3. apps/web:build
```

### outputs

What to cache after task runs.

```json
{
  "build": {
    "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
  }
}
```

**Patterns:**
- `dist/**` - Include folder
- `!dist/temp/**` - Exclude subfolder

### cache

```json
{
  "dev": {
    "cache": false,     // Never cache
    "persistent": true  // Long-running task
  }
}
```

## Running Tasks

```bash
# Run build in all packages
bunx turbo run build

# Run in specific package
bunx turbo run build --filter=@cc/web

# Run in package and its dependencies
bunx turbo run build --filter=@cc/web...

# Run in changed packages only
bunx turbo run build --filter=[HEAD^1]

# Parallel tasks
bunx turbo run lint typecheck --parallel
```

## Filter Syntax

| Pattern | Meaning |
|---------|---------|
| `--filter=web` | Package named "web" |
| `--filter=@cc/*` | All @cc scoped packages |
| `--filter=./apps/*` | Packages in apps/ |
| `--filter=web...` | web + its dependencies |
| `--filter=...web` | web + its dependents |
| `--filter=[origin/main]` | Changed since main |

## Caching

Turbo hashes inputs to determine cache hits:
- Source files
- Dependencies
- Environment variables
- Task configuration

```bash
# See cache status
bunx turbo run build --summarize

# Force no cache
bunx turbo run build --force

# Clear cache
bunx turbo run build --no-cache
```

## Remote Caching

Share cache across team/CI:

```bash
bunx turbo login
bunx turbo link
```

Now cached builds are shared!

## Pipeline vs Tasks

**Old (pipeline):**
```json
{
  "pipeline": {
    "build": {}
  }
}
```

**New (tasks) - Turbo 2.0+:**
```json
{
  "tasks": {
    "build": {}
  }
}
```

## Common Patterns

### 1. Development
```json
{
  "dev": {
    "cache": false,
    "persistent": true
  }
}
```

### 2. CI Build
```json
{
  "build": {
    "dependsOn": ["^build"],
    "outputs": ["dist/**"]
  }
}
```

### 3. Testing
```json
{
  "test": {
    "dependsOn": ["build"],
    "inputs": ["src/**", "tests/**"]
  }
}
```

### 4. Type-checking
```json
{
  "typecheck": {
    "dependsOn": ["^typecheck"]
  }
}
```

## Root package.json Scripts

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  }
}
```

## Exercise

1. Check your turbo config:
```bash
cat turbo.json
```

2. Run with summary:
```bash
bunx turbo run build --summarize
```

3. Check cache hit rate:
```bash
bunx turbo run build
# Run again - should show FULL TURBO (cached)
bunx turbo run build
```
