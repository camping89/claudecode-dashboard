# Bun + Hono + Turborepo with Next.js 16 Research

## 1. Bun Workspace Configuration

Bun supports npm workspaces via `package.json`. Structure:

```
root/
├── package.json        (declares workspaces)
├── bun.lock            (text-based, v1 format as of Jan 2025)
└── packages/
    ├── pkg-a/package.json
    ├── pkg-b/package.json
    └── shared/types/package.json
```

**Root package.json:**
```json
{
  "name": "cc-dashboard",
  "private": true,
  "packageManager": "bun@1.2.0",
  "workspaces": ["apps/*", "packages/*"]
}
```

**Workspace dependencies** use `workspace:` protocol:
```json
{
  "dependencies": {
    "@cc/types": "workspace:*",
    "@cc/utils": "workspace:^"
  }
}
```

**Install to specific workspaces:**
```bash
bun install
bun add express --cwd apps/api
bun install --filter "pkg-*"
```

Key: Root `package.json` MUST NOT contain deps—only workspaces declare their own.

---

## 2. Turborepo Setup with Bun

**Status:** Stable since Turborepo 2.6 (Dec 2024). Bun lockfile parser added for v1 format.

**turbo.json:**
```json
{
  "extends": ["//"],
  "globalDependencies": ["**/.env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next", "dist"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "type-check": {
      "outputs": []
    }
  }
}
```

**Initialize:**
```bash
bun i -g turbo@latest
bunx create-turbo@latest
```

**Key points:**
- Lockfile presence is critical for dependency analysis
- Use `dependsOn: ["^build"]` for cross-package deps
- `persistent: true` prevents dependents from blocking on long-running tasks
- Bun workspace resolution requires explicit `packageManager` declaration

---

## 3. Hono on Bun Runtime

**Setup:**
```bash
bun create hono@latest my-api
cd my-api && bun i
bun run dev
```

**Basic app (src/index.ts):**
```typescript
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('Hello Hono!'))
app.post('/posts', (c) => c.json({ created: true }, 201))

export default app
```

**Bun.serve entry point:**
```typescript
export default {
  fetch: app.fetch,
  port: 3000,
}
```

**Advantages:** Native Bun runtime = zero Node.js runtime overhead. Hono on Bun ~100x faster than npx for CLI tasks.

---

## 4. Sharing Packages (Types, Utils)

**Structure:**
```
packages/
├── shared-types/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── api.ts      (export type ApiResponse = { ... })
│       └── index.ts    (re-exports)
└── shared-utils/
    ├── package.json
    └── src/
        └── validation.ts
```

**shared-types/package.json:**
```json
{
  "name": "@cc/types",
  "version": "0.0.1",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" }
  },
  "scripts": {
    "build": "tsc",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": { "typescript": "^5.0" }
}
```

**Consumer (e.g., API app):**
```json
{
  "dependencies": { "@cc/types": "workspace:*" }
}
```

**In code:**
```typescript
import type { ApiResponse } from '@cc/types'

const response: ApiResponse = { success: true }
```

---

## 5. File Watching with Bun

Bun has native watchers (not chokidar)—simpler & faster:

```bash
bun --watch src/index.ts      # Hard restart on changes
bun --hot src/index.ts        # Soft reload, preserves globalThis
bun build --watch --no-clear-screen
```

**`--watch` vs `--hot`:**
- `--watch`: Full process restart. Good for API development.
- `--hot`: Module cache update. Preserves global state. Good for dev servers.

**For concurrent dev:**
```json
{
  "scripts": {
    "dev": "bun --watch src/index.ts --no-clear-screen"
  }
}
```

No external file watcher needed—Bun uses OS-native APIs (kqueue/inotify).

---

## 6. WebSocket Setup in Hono

**Bun native WebSocket + Hono:**

```typescript
import { Hono } from 'hono'
import { upgradeWebSocket, websocket } from 'hono/bun'

const app = new Hono()

app.get('/ws', upgradeWebSocket((c) => {
  return {
    onMessage(event, ws) {
      console.log(`Client: ${event.data}`)
      ws.send('Server received')
    },
    onClose: () => console.log('Closed'),
    onError: (err) => console.error(err),
  }
}))

export default {
  fetch: app.fetch,
  websocket, // Enable WebSocket in Bun.serve()
}
```

**Pub/Sub (Topic broadcasting):**
```typescript
app.get('/ws/:topic', upgradeWebSocket((c) => {
  const topic = c.req.param('topic')

  return {
    onOpen(_, ws) {
      ws.raw.subscribe(topic)
    },
    onMessage(event, ws) {
      ws.raw.publish(topic, JSON.stringify({
        from: 'client',
        data: event.data,
      }))
    },
    onClose() {
      console.log(`Left ${topic}`)
    },
  }
}))
```

**Key:** Access raw Bun ServerWebSocket via `ws.raw` for native pub/sub. Hono wrapper handles protocol.

---

## Summary

| Component | Config | Notes |
|-----------|--------|-------|
| **Bun workspaces** | `package.json` + `workspace:*` | Fast, supports globs, cwd-based installs |
| **Turborepo** | `turbo.json` pipeline | Stable 2.6+, bun.lock v1 parser ready |
| **Hono** | Import from `hono` | Works identically on Bun as other runtimes |
| **Shared pkgs** | `@cc/types`, `@cc/utils` | Type-only or utilities in separate workspace |
| **File watching** | `bun --watch/--hot` | Native OS API, no external deps |
| **WebSocket** | `upgradeWebSocket` + `websocket` export | Native Bun pub/sub via `ws.raw` |

**Next.js 16:** Standard setup in separate workspace (apps/web). No special Bun config needed—Next.js uses Turbopack by default.

---

## Unresolved Questions
- Exact performance metrics for Turborepo + Bun vs npm/pnpm (empirical testing needed)
- Socket.IO integration status with newer Bun versions (post-v1.2)
- TypeScript path alias resolution across workspace boundaries in IDE
