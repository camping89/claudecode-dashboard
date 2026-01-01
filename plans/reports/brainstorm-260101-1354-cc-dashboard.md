# Claude Code Dashboard - Comprehensive Configuration Viewer

**Date:** 2026-01-01
**Type:** Brainstorm Report
**Status:** ✅ Finalized

---

## Problem Statement

Build a read-only dashboard to comprehensively display all Claude Code configurations, settings, and registered components. Must be exhaustive—nothing missed.

---

## Final Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Runtime** | Bun | Fast, native TypeScript |
| **Backend** | Hono | Bun-native, Express-like API |
| **Frontend** | Next.js 14+ App Router | React Server Components |
| **Styling** | Tailwind CSS + shadcn/ui | Copy-paste components |
| **Monorepo** | Turborepo + Bun workspaces | Caching, parallel builds |
| **File Watching** | chokidar + WebSocket | Real-time config updates |
| **Port** | 4173 | Uncommon, available |

---

## Monorepo Structure

```
cc-dashboard/
├── apps/
│   ├── web/                     # Next.js frontend
│   │   ├── app/                 # App Router pages
│   │   ├── components/          # shadcn/ui + custom
│   │   └── lib/                 # Frontend utilities
│   └── api/                     # Hono backend
│       ├── src/
│       │   ├── routes/          # API endpoints
│       │   ├── services/        # Config readers
│       │   └── watchers/        # chokidar file watchers
│       └── index.ts             # Entry point
├── packages/
│   ├── config-reader/           # Shared: parse Claude configs
│   └── types/                   # Shared TypeScript types
├── package.json                 # Bun workspace root
├── bun.lockb
└── turbo.json
```

---

## Configuration Categories (21 Total)

### 1. Settings & Preferences
| Item | Source | Display Priority |
|------|--------|------------------|
| `settings.json` (user/project/local) | `~/.claude/settings.json`, `.claude/settings.json` | High |
| `settings.local.json` | `.claude/settings.local.json` | High |
| Model configuration | settings.json `model` field | High |
| Output style | settings.json `outputStyle` | Medium |
| Thinking mode | `alwaysThinkingEnabled` | Medium |
| Permission rules | `permissions.allow/ask/deny[]` | High |
| Sandbox config | `sandbox.*` settings | High |
| Environment variables | `env` object | Medium |

### 2. Memory Files
| Item | Path |
|------|------|
| User memory | `~/.claude/CLAUDE.md` |
| Project memory | `.claude/CLAUDE.md` |
| Local memory | `.claude/CLAUDE.local.md` |
| Rules directory | `.claude/rules/` |

### 3. Skills System
| Field | Description |
|-------|-------------|
| name | Skill identifier |
| description | When/how to use |
| allowed-tools | Tool restrictions |
| model | Model override |
| **Locations** | `~/.claude/skills/`, `.claude/skills/`, plugin `skills/` |

### 4. Agents (Subagents)
| Field | Description |
|-------|-------------|
| name | Agent identifier |
| description | Invocation trigger |
| tools | Allowed tools (comma-sep) |
| model | Model (or 'inherit') |
| permissionMode | default/acceptEdits/bypassPermissions/plan/ignore |
| skills | Auto-load skills |
| disallowedTools | Blocked tools |
| **Locations** | `~/.claude/agents/`, `.claude/agents/`, plugin `agents/` |
| **Built-in** | general-purpose, Plan, Explore |

### 5. Slash Commands
| Category | Source |
|----------|--------|
| Built-in | 30+ commands (/help, /mcp, /model, /config, etc.) |
| Custom (user) | `~/.claude/commands/` |
| Custom (project) | `.claude/commands/` |
| MCP prompts | `/mcp__<server>__<prompt>` |
| Plugin commands | `plugins/*/commands/` |

### 6. Plugins
| Component | Description |
|-----------|-------------|
| Installed plugins | List from `~/.claude/plugins/` |
| Enabled/disabled state | `enabledPlugins` map |
| Plugin manifest | `plugin.json` fields |
| Commands | Plugin-provided commands |
| Agents | Plugin-provided agents |
| Skills | Plugin-provided skills |
| Hooks | Plugin-provided hooks |
| MCP servers | Plugin-provided MCP |
| Output styles | Plugin-provided styles |
| Marketplaces | `extraKnownMarketplaces` |

### 7. Hooks System (8 Event Types)
| Event | Matchers |
|-------|----------|
| SessionStart | startup, resume, clear, compact |
| SessionEnd | clear, logout, prompt_input_exit, other |
| PreToolUse | Tool names (Bash, Read, Write, etc.) |
| PostToolUse | Tool names |
| PermissionRequest | Tool names |
| UserPromptSubmit | None |
| Stop | None |
| SubagentStop | None |
| PreCompact | manual, auto |
| Notification | permission_prompt, idle_prompt, auth_success, elicitation_dialog |
| SubagentStart | None |

**Hook Config Fields:** matcher, type (command/prompt), command, prompt, timeout, model

### 8. MCP Servers
| Source | File |
|--------|------|
| User/local | `~/.claude.json` mcpServers |
| Project | `.mcp.json` |
| Enterprise managed | `managed-mcp.json` |
| Plugin-provided | Plugin `.mcp.json` |

**Server Config:** type (http/sse/stdio), url, command, args[], env, headers, scope

### 9. Output Styles
| Type | Location |
|------|----------|
| Built-in | Default, Explanatory, Learning |
| Custom (user) | `~/.claude/output-styles/` |
| Custom (project) | `.claude/output-styles/` |
| Plugin-provided | Plugin `outputStyles/` |

### 10. Models
| Alias | Description |
|-------|-------------|
| default | Recommended for account |
| sonnet | Latest Sonnet (4.5) |
| opus | Latest Opus (4.5) |
| haiku | Fast Haiku |
| sonnet[1m] | 1M context |
| opusplan | Opus planning, Sonnet execution |

### 11. Environment Variables (Categorized)
| Category | Examples |
|----------|----------|
| Authentication | ANTHROPIC_API_KEY, AWS_BEARER_TOKEN_BEDROCK |
| Cloud provider | CLAUDE_CODE_USE_BEDROCK/VERTEX/FOUNDRY |
| Networking | HTTP_PROXY, HTTPS_PROXY, NO_PROXY |
| Tool config | BASH_DEFAULT_TIMEOUT_MS, BASH_MAX_OUTPUT_LENGTH |
| Feature toggles | DISABLE_AUTOUPDATER, DISABLE_TELEMETRY |
| Performance | MCP_TIMEOUT, MCP_TOOL_TIMEOUT |

### 12. Permissions
| Type | Example |
|------|---------|
| Bash | `Bash(git:*)`, `Bash(npm:*)` |
| Read | `Read(src/**)` |
| Edit | `Edit(*.ts)` |
| Write | `Write(*.md)` |
| MCP | `mcp__server__*` |
| SlashCommand | `SlashCommand:/custom` |

### 13. Available Tools (17 Core + MCP)
Core: AskUserQuestion, Bash, BashOutput, Edit, ExitPlanMode, Glob, Grep, KillShell, NotebookEdit, Read, Skill, SlashCommand, Task, TodoWrite, WebFetch, WebSearch, Write

### 14. IDE Integrations
- VS Code extension settings
- JetBrains plugin settings
- Terminal setup status

### 15. Status Line
Custom status line script configuration

### 16. Authentication
- Login method (claudeai/console)
- Organization UUID
- OAuth states for MCP

### 17. Projects
Project configurations in `~/.claude/projects/`

### 18. Sessions
- Active/recent sessions
- Named sessions
- Session history

### 19. Enterprise/Managed Settings
| Setting | Purpose |
|---------|---------|
| managed-settings.json | System-level overrides |
| allowManagedHooksOnly | Block user hooks |
| allowedMcpServers[] | MCP allowlist |
| deniedMcpServers[] | MCP denylist |
| strictKnownMarketplaces[] | Marketplace restrictions |

### 20. Todos
Active todo lists from `~/.claude/todos/`

### 21. Metadata & Stats
- `metadata.json` - User metadata
- `history.jsonl` - Command history
- Usage statistics
- Credentials (masked)

---

## Dashboard Architecture Options

### Option A: Static HTML + File Readers (Recommended)
**Pros:** Simple, portable, works anywhere, no server needed
**Cons:** No real-time updates
**Tech:** Vanilla JS/TypeScript, file system APIs, JSON parsing

### Option B: Electron App
**Pros:** Native feel, file system access
**Cons:** Heavy, requires build pipeline
**Tech:** Electron, React/Vue

### Option C: CLI + Web Server
**Pros:** Can leverage existing Claude Code infrastructure
**Cons:** Requires running server
**Tech:** Node.js, Express, React

### Option D: VS Code Extension Panel
**Pros:** Integrated with IDE, already have Claude Code extension
**Cons:** Limited to VS Code users
**Tech:** VS Code WebView API

**Recommendation:** Option A (Static HTML) for simplicity and portability. Can be opened directly in browser.

---

## Proposed UI Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Claude Code Configuration Dashboard            [Refresh] │
├─────────────────────────────────────────────────────────────┤
│ Sidebar                  │ Main Content                     │
│ ─────────                │ ───────────────                  │
│ ○ Overview               │ [Selected section content]       │
│ ○ Settings               │                                  │
│ ○ Memory                 │                                  │
│ ○ Skills                 │                                  │
│ ○ Agents                 │                                  │
│ ○ Commands               │                                  │
│ ○ Plugins                │                                  │
│ ○ Hooks                  │                                  │
│ ○ MCP Servers            │                                  │
│ ○ Output Styles          │                                  │
│ ○ Models                 │                                  │
│ ○ Permissions            │                                  │
│ ○ Tools                  │                                  │
│ ○ Environment            │                                  │
│ ○ IDE                    │                                  │
│ ○ Sessions               │                                  │
│ ○ Enterprise             │                                  │
│ ○ Raw Files              │                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Collection Strategy

1. **Node.js Script** - Collects all configs, outputs single JSON
2. **Dashboard HTML** - Loads JSON, renders sections
3. **Optional:** Watch mode for live updates

---

## Implementation Considerations

### Must Have
- Read-only (no modifications)
- All 21 categories displayed
- Source file paths shown
- JSON syntax highlighting
- Search/filter across all sections
- Collapsible sections
- Export to JSON/Markdown

### Nice to Have
- Dark/light theme
- Config validation warnings
- Diff between user/project/enterprise
- Dependency graph (plugins → MCP → tools)
- Quick copy to clipboard

### Technical Risks
1. **File Access** - Browser can't read local files directly; need either:
   - Node.js collector script (recommended)
   - Electron wrapper
   - User uploads config files

2. **Large Files** - `metadata.json` can be 200KB+; need lazy loading

3. **Sensitive Data** - Mask API keys, tokens in display

---

## Success Metrics

- Displays 100% of Claude Code configuration categories
- Loads within 2 seconds
- Zero setup required beyond running collector script
- Searchable across all content

---

## Next Steps

1. Confirm architecture choice (Option A recommended)
2. Define JSON schema for collected data
3. Build collector script
4. Build dashboard HTML/JS
5. Test across Windows/macOS/Linux

---

## Resolved Decisions

| Question | Decision |
|----------|----------|
| Architecture | CLI + Web Server (Bun + Hono backend) |
| UI Framework | Next.js 14+ with App Router |
| Styling | Tailwind + shadcn/ui |
| Monorepo | Turborepo + Bun workspaces |
| Port | 4173 |
| File watching | chokidar + WebSocket (real-time) |
| Config path | Default to user scope (`~/.claude/`) |
| Sidebar priority | Show all 21 categories (senior dev visibility) |

## Remaining Questions

1. Multiple config profiles (home vs work)?
2. Show empty enterprise sections if user has none?
3. Mask credentials or show placeholder `[REDACTED]`?

