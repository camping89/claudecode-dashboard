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
- Summaries are cached in `~/.claude/cc-dashboard/cache.json`
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
