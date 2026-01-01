# Monorepo Fundamentals

## What is a Monorepo?

Single repository containing multiple distinct projects/packages that are related but can be deployed independently.

**Contrast with:**
- **Polyrepo**: Each project in its own repository
- **Monolith**: Single deployable unit

## Why Monorepo?

| Benefit | Description |
|---------|-------------|
| **Atomic Changes** | Cross-package refactors in single commit |
| **Shared Code** | Internal packages without npm publishing |
| **Unified Tooling** | Same lint/test/build configs |
| **Dependency Consistency** | Single lockfile, no version drift |
| **Simplified CI** | One pipeline, selective builds |

## Standard Directory Structure

```
my-monorepo/
├── apps/           # Deployable applications
│   ├── web/        # Next.js frontend
│   ├── api/        # Backend service
│   └── mobile/     # React Native app
├── packages/       # Shared internal packages
│   ├── ui/         # Component library
│   ├── utils/      # Shared utilities
│   └── types/      # TypeScript definitions
├── package.json    # Root workspace config
├── bun.lockb       # Single lockfile
└── turbo.json      # Build orchestration (optional)
```

## apps/ vs packages/

### apps/
- **Deployable** - has entry point, runs as service/app
- **Consumes** packages but rarely consumed by others
- **Examples**: web servers, CLI tools, mobile apps, desktop apps

### packages/
- **Consumed** by apps or other packages
- **Not directly deployable** - no standalone entry point
- **Examples**: UI libraries, shared types, utilities, configs

## Mental Model

```
apps = things users interact with directly
packages = building blocks for apps
```

Think of it like:
- **apps/** = Finished products (car, phone, laptop)
- **packages/** = Components (engine, battery, screen)

## Why This Convention?

1. **Clarity**: Immediately know what's deployable vs shared
2. **Build Optimization**: Tools can prioritize app builds
3. **Dependency Direction**: apps → packages (never reverse)
4. **Team Organization**: Different teams own different apps

## Exercise

Look at your project:
```bash
ls -la apps/
ls -la packages/
```

Identify:
- Which apps consume which packages?
- Could any app code be extracted to a package?
