# ClaudeCode Dashboard

CLI dashboard for viewing Claude Code configurations.

## Installation

```bash
# npm
npm install -g claudecode-dashboard

# bun
bun add -g claudecode-dashboard
```

## Usage

```bash
# Interactive TUI
claudecode-dashboard
ccd  # short alias

# JSON output (all configs)
ccd --json

# Specific category
ccd skills
ccd agents --json
ccd mcp

# Pipe to jq
ccd skills --json | jq '.[].name'
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ↑↓ / jk | Navigate items |
| ←→ / hl | Switch panels |
| PgUp / u | Page up (10 items) |
| PgDn / d | Page down (10 items) |
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
| Hooks | `~/.claude/settings.json` → `hooks` |
| MCP Servers | `~/.mcp.json` + `./.mcp.json` |
| Plugins | `~/.claude/plugins/` |

## AI Summaries (Optional)

The dashboard shows a 30-line preview of skill/agent/command files by default.
For AI-generated summaries, set one of these environment variables:

```bash
# Option 1: Anthropic Claude (recommended)
export ANTHROPIC_API_KEY=sk-ant-...

# Option 2: OpenAI
export OPENAI_API_KEY=sk-...
```

**Models Used:**
- Anthropic: `claude-haiku-4-5-latest` (fast, efficient)
- OpenAI: `gpt-5.2-mini` (fast, cheap)

**Features:**
- Summaries are cached in `~/.claude/claudecode-dashboard/cache.json`
- Cache invalidates automatically when files change
- Status bar shows current provider and model
- Without API key: shows `Preview` (first 30 lines of markdown)

**Privacy:** Your API key is used locally only. No data is sent anywhere except to the LLM provider you configure.

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
