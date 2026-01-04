# CC Dashboard

CLI dashboard for viewing Claude Code configurations.

## Installation

```bash
# npm
npm install -g cc-dashboard

# bun
bun add -g cc-dashboard
```

## Usage

```bash
# Interactive TUI
cc-dashboard

# JSON output (all configs)
cc-dashboard --json

# Specific category
cc-dashboard skills
cc-dashboard agents --json
cc-dashboard mcp

# Pipe to jq
cc-dashboard skills --json | jq '.[].name'
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ↑↓ | Navigate items |
| ←→ | Switch panels |
| Enter | Select/expand |
| r | Refresh |
| q | Quit |

## Config Locations

| Config | Path |
|--------|------|
| Settings | `~/.claude/settings.json` |
| Skills | `~/.claude/skills/` |
| Agents | `~/.claude/agents/` |
| Commands | `~/.claude/commands/` |
| Hooks | `~/.claude/hooks/hooks.json` |
| MCP Servers | `~/.claude.json` → `mcpServers` |
| Plugins | `~/.claude/plugins/` |

## Requirements

- Terminal width: 80+ columns
- Node.js 20+ or Bun 1.2+

## Development

```bash
# Install dependencies
bun install

# Run in development
bun run dev

# Build
bun run build

# Type check
bun run type-check
```

## License

MIT
