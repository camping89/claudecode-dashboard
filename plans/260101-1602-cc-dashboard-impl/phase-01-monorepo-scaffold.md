---
phase: 01
title: "Monorepo Scaffold"
status: pending
effort: 1.5h
dependencies: []
---

# Phase 01: Monorepo Scaffold

## Context

- Parent: [plan.md](./plan.md)
- Research: [Bun + Turborepo](./research/researcher-01-bun-hono-turborepo.md)

---

## Overview

Initialize Turborepo + Bun workspace monorepo with apps and packages directories.

---

## Implementation Steps

### 1. Initialize Root

```bash
mkdir cc-dashboard && cd cc-dashboard
bun init -y
```

### 2. Root package.json

```json
{
  "name": "cc-dashboard",
  "private": true,
  "packageManager": "bun@1.2.0",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "type-check": "turbo type-check"
  },
  "devDependencies": {
    "turbo": "^2.6.0",
    "typescript": "^5.7.0"
  }
}
```

### 3. turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

### 4. Base tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

### 5. Create Directory Structure

```bash
mkdir -p apps/web apps/api packages/types packages/config-reader
```

### 6. .gitignore

```gitignore
node_modules
.turbo
dist
.next
*.log
.env*.local
bun.lockb
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `package.json` | Workspace root |
| `turbo.json` | Turborepo pipeline |
| `tsconfig.json` | Base TypeScript config |
| `.gitignore` | Git ignore patterns |

---

## Verification

```bash
bun install
turbo --version
```

---

## Success Criteria

- [ ] `bun install` succeeds
- [ ] `turbo` command available
- [ ] Directory structure created
- [ ] No TypeScript errors in base config
