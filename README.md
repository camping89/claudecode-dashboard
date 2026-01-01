# CC Dashboard

Read-only dashboard for viewing Claude Code configurations.

## Prerequisites

- [Bun](https://bun.sh) v1.2+

## Quick Start

```bash
# Install dependencies
bun install

# Run both API + Web in parallel
bun run dev
```

- **API**: http://localhost:4173
- **Web**: http://localhost:3000

## Config Locations

Dashboard reads from default Claude Code paths:

| Config | Path |
|--------|------|
| Settings | `~/.claude/settings.json` |
| Skills | `~/.claude/skills/` |
| Agents | `~/.claude/agents/` |
| Commands | `~/.claude/commands/` |
| Hooks | `~/.claude/hooks/hooks.json` |
| Plugins | `~/.claude/plugins/` |
| MCP Servers | `~/.claude.json` → `mcpServers` |

## Project Structure

```
cc-dashboard/
├── apps/
│   ├── api/           # Hono backend (port 4173)
│   └── web/           # Next.js frontend (port 3000)
├── packages/
│   ├── types/         # Shared TypeScript types
│   └── config-reader/ # Config file parsers
```

## Scripts

```bash
bun run dev         # Start both servers (turbo)
bun run build       # Build all packages
bun run type-check  # TypeScript validation
```

## Testing Individual Packages

```bash
# API only
bun run --filter @cc/api dev

# Web only
bun run --filter @cc/web dev
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /api/config/all` | All configs at once |
| `GET /api/config/settings` | Settings only |
| `GET /api/config/skills` | Skills list |
| `GET /api/config/agents` | Agents list |
| `GET /api/config/commands` | Commands list |
| `GET /api/config/hooks` | Hooks list |
| `GET /api/config/plugins` | Plugins list |
| `GET /api/config/mcp` | MCP servers |
| `WS /ws` | Real-time updates |

## Real-time Updates

WebSocket at `ws://localhost:4173/ws` broadcasts config changes detected by chokidar file watcher.

Message format:
```json
{"type": "config-update", "category": "skills", "data": [...]}
```

## Tech Stack

- **Runtime**: Bun
- **Monorepo**: Turborepo
- **API**: Hono + Bun native WebSocket
- **Frontend**: Next.js 15 + React 19 + Tailwind + shadcn/ui
- **File Watching**: chokidar
