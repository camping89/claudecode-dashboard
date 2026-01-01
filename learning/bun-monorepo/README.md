# Bun Monorepo Learning Guide

A practical guide to understanding Bun workspaces, the apps/packages convention, and monorepo best practices.

## Contents

| File | Topic | Key Concepts |
|------|-------|--------------|
| [01-monorepo-fundamentals](./01-monorepo-fundamentals.md) | Why monorepos? | apps vs packages, directory structure |
| [02-bun-workspaces](./02-bun-workspaces.md) | Workspace mechanics | `workspace:*`, symlinks, hoisting |
| [03-package-anatomy](./03-package-anatomy.md) | Package structure | exports, types, peer deps |
| [04-turborepo-orchestration](./04-turborepo-orchestration.md) | Build orchestration | tasks, caching, filtering |
| [05-dependency-management](./05-dependency-management.md) | Deps handling | versions, lockfile, hoisting |
| [06-practical-examples](./06-practical-examples.md) | Real patterns | utils, types, UI, config packages |

## Learning Path

```
1. Fundamentals → Understand why apps/ and packages/ exist
2. Workspaces → Learn how Bun links everything
3. Package Anatomy → Know how to structure a package
4. Turborepo → Orchestrate builds efficiently
5. Dependencies → Manage versions correctly
6. Examples → Apply knowledge with real patterns
```

## Quick Commands

```bash
# See workspace structure
ls apps/ packages/

# Check symlinks
ls -la node_modules/@cc/

# Run turborepo task
bunx turbo run build

# Add internal package
bun add @cc/types --cwd apps/web
```

## This Project Structure

```
cc-dashboard/
├── apps/
│   └── web/          # Next.js dashboard
├── packages/
│   ├── types/        # Shared TypeScript types
│   └── config-reader/# Config file parsing
├── package.json      # Workspace root
├── bun.lockb         # Single lockfile
└── turbo.json        # Build orchestration
```

## Key Takeaways

1. **apps/** = deployable applications
2. **packages/** = shared code consumed by apps
3. `workspace:*` links internal packages
4. Single `bun.lockb` for consistency
5. Turborepo caches + parallelizes builds
