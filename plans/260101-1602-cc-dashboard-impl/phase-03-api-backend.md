---
phase: 03
title: "API Backend"
status: pending
effort: 3h
dependencies: [phase-02]
---

# Phase 03: API Backend (Hono + Bun)

## Context

- Parent: [plan.md](./plan.md)
- Depends on: [Phase 02](./phase-02-shared-packages.md)
- Research: [Hono + WebSocket](./research/researcher-01-bun-hono-turborepo.md)

---

## Overview

Build Hono API server on port 4173 with REST endpoints for each config category + WebSocket for real-time updates.

---

## Implementation Steps

### 1. apps/api/package.json

```json
{
  "name": "@cc/api",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "bun --watch src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target bun",
    "start": "bun dist/index.js",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@cc/config-reader": "workspace:*",
    "@cc/types": "workspace:*",
    "chokidar": "^4.0.0",
    "hono": "^4.7.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.7.0"
  }
}
```

### 2. apps/api/tsconfig.json

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["bun-types"]
  },
  "include": ["src/**/*"]
}
```

### 3. apps/api/src/index.ts

```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { upgradeWebSocket, websocket } from 'hono/bun'
import { configRoutes } from './routes/config-routes'
import { createWatcher } from './services/watcher'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:4173'],
}))

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Config API routes
app.route('/api/config', configRoutes)

// WebSocket endpoint for real-time updates
const clients = new Set<WebSocket>()

app.get('/ws', upgradeWebSocket((c) => ({
  onOpen(_, ws) {
    clients.add(ws.raw as unknown as WebSocket)
    console.log(`Client connected. Total: ${clients.size}`)
  },
  onClose(_, ws) {
    clients.delete(ws.raw as unknown as WebSocket)
    console.log(`Client disconnected. Total: ${clients.size}`)
  },
  onError(err) {
    console.error('WebSocket error:', err)
  },
})))

// Broadcast function for file watcher
export function broadcast(message: object) {
  const data = JSON.stringify(message)
  for (const client of clients) {
    try {
      client.send(data)
    } catch {
      clients.delete(client)
    }
  }
}

// Start file watcher
createWatcher(broadcast)

// Export for Bun.serve
export default {
  fetch: app.fetch,
  websocket,
  port: 4173,
}

console.log('🚀 API server running on http://localhost:4173')
```

### 4. apps/api/src/routes/config-routes.ts

```typescript
import { Hono } from 'hono'
import type { ApiResponse, ConfigCategory } from '@cc/types'
import {
  readSettings,
  readSkills,
  readAgents,
  readCommands,
  readHooks,
  readMcpServers,
  readPlugins,
} from '@cc/config-reader'

const configRoutes = new Hono()

// Generic response wrapper
function respond<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  }
}

// GET /api/config - All categories summary
configRoutes.get('/', async (c) => {
  const [settings, skills, agents, commands, hooks, mcp, plugins] = await Promise.all([
    readSettings(),
    readSkills(),
    readAgents(),
    readCommands(),
    readHooks(),
    readMcpServers(),
    readPlugins(),
  ])

  return c.json(respond({
    settings,
    skills,
    agents,
    commands,
    hooks,
    mcp,
    plugins,
  }))
})

// GET /api/config/settings
configRoutes.get('/settings', async (c) => {
  const data = await readSettings()
  return c.json(respond(data))
})

// GET /api/config/skills
configRoutes.get('/skills', async (c) => {
  const data = await readSkills()
  return c.json(respond(data))
})

// GET /api/config/agents
configRoutes.get('/agents', async (c) => {
  const data = await readAgents()
  return c.json(respond(data))
})

// GET /api/config/commands
configRoutes.get('/commands', async (c) => {
  const data = await readCommands()
  return c.json(respond(data))
})

// GET /api/config/hooks
configRoutes.get('/hooks', async (c) => {
  const data = await readHooks()
  return c.json(respond(data))
})

// GET /api/config/mcp
configRoutes.get('/mcp', async (c) => {
  const data = await readMcpServers()
  return c.json(respond(data))
})

// GET /api/config/plugins
configRoutes.get('/plugins', async (c) => {
  const data = await readPlugins()
  return c.json(respond(data))
})

export { configRoutes }
```

### 5. apps/api/src/services/watcher.ts

```typescript
import chokidar from 'chokidar'
import { CLAUDE_PATHS, getClaudeDir } from '@cc/config-reader'
import type { WsMessage } from '@cc/types'

type BroadcastFn = (message: WsMessage) => void

export function createWatcher(broadcast: BroadcastFn) {
  const claudeDir = getClaudeDir()

  // Watch with chokidar for cross-platform reliability
  const watcher = chokidar.watch(claudeDir, {
    persistent: true,
    ignoreInitial: true,
    depth: 3,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  })

  watcher.on('change', (filepath) => {
    const category = getCategoryFromPath(filepath)
    if (!category) return

    console.log(`File changed: ${filepath} (${category})`)

    broadcast({
      type: 'config-update',
      category,
      message: `${filepath} was modified`,
    })
  })

  watcher.on('add', (filepath) => {
    const category = getCategoryFromPath(filepath)
    if (!category) return
    broadcast({ type: 'config-update', category, message: `${filepath} added` })
  })

  watcher.on('unlink', (filepath) => {
    const category = getCategoryFromPath(filepath)
    if (!category) return
    broadcast({ type: 'config-update', category, message: `${filepath} removed` })
  })

  console.log(`👁️ Watching ${claudeDir} for changes (chokidar)`)

  // Cleanup on process exit
  process.on('SIGINT', () => {
    watcher.close()
    process.exit(0)
  })

  return watcher
}

function getCategoryFromPath(filename: string): string | null {
  if (filename.includes('settings')) return 'settings'
  if (filename.includes('skills')) return 'skills'
  if (filename.includes('agents')) return 'agents'
  if (filename.includes('commands')) return 'commands'
  if (filename.includes('hooks')) return 'hooks'
  if (filename.includes('plugins')) return 'plugins'
  if (filename.includes('output-styles')) return 'output-styles'
  if (filename.includes('CLAUDE.md')) return 'memory'
  if (filename.includes('metadata')) return 'metadata'
  if (filename.includes('.mcp.json')) return 'mcp'
  return null
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/config` | All categories summary |
| GET | `/api/config/settings` | Settings only |
| GET | `/api/config/skills` | Skills list |
| GET | `/api/config/agents` | Agents list |
| GET | `/api/config/commands` | Commands list |
| GET | `/api/config/hooks` | Hooks list |
| GET | `/api/config/mcp` | MCP servers |
| GET | `/api/config/plugins` | Plugins list |
| WS | `/ws` | Real-time updates |

---

## Files to Create

| File | Purpose |
|------|---------|
| `apps/api/package.json` | Package manifest |
| `apps/api/tsconfig.json` | TypeScript config |
| `apps/api/src/index.ts` | Entry + WebSocket |
| `apps/api/src/routes/config-routes.ts` | REST endpoints |
| `apps/api/src/services/watcher.ts` | File watcher |

---

## Verification

```bash
cd apps/api
bun install
bun run dev

# Test endpoints
curl http://localhost:4173/health
curl http://localhost:4173/api/config
```

---

## Success Criteria

- [ ] Server starts on port 4173
- [ ] Health endpoint returns OK
- [ ] Config endpoints return data
- [ ] WebSocket accepts connections
- [ ] File changes trigger broadcasts
