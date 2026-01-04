# Phase 5: Build & Publish

**Status:** Pending
**Estimated Files:** 3

---

## Objective

Configure dual builds (tsup + bun), test installation, publish to npm.

---

## Tasks

### 5.1 Test tsup Build

```bash
# Build for npm
bun run build

# Verify output
ls -la dist/
# Should show: cli.js (bundled, ~500KB-1MB)

# Test execution
node dist/cli.js --help
node dist/cli.js --json | head
```

### 5.2 Test Bun Binary Build

```bash
# Build native binary
bun run build:bun

# Verify output
ls -la dist/
# Should show: cc-dashboard (native binary, ~50-100MB)

# Test execution
./dist/cc-dashboard --help
./dist/cc-dashboard --json | head
```

### 5.3 Create .npmignore

```
# Development
src/
tsconfig.json
tsup.config.ts
.git/
.github/
plans/
learning/
.playwright-mcp/

# Build artifacts (keep dist/)
*.log
.DS_Store
```

### 5.4 Update README.md

```markdown
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

- Terminal width: 120+ columns (for side panel)
- Node.js 20+ or Bun 1.2+
```

### 5.5 Local Install Test

```bash
# Test npm global install
npm pack
npm install -g ./cc-dashboard-1.0.0.tgz
cc-dashboard --help
npm uninstall -g cc-dashboard

# Test bun global install
bun link
bun link cc-dashboard
cc-dashboard --help
bun unlink cc-dashboard
```

### 5.6 Publish to npm

```bash
# Login (if not already)
npm login

# Dry run
npm publish --dry-run

# Publish
npm publish --access public
```

---

## Pre-Publish Checklist

- [ ] `package.json` version is correct
- [ ] `package.json` has all required fields (name, description, keywords, license)
- [ ] `README.md` is complete and accurate
- [ ] `.npmignore` excludes dev files
- [ ] `bun run build` produces working `dist/cli.js`
- [ ] `node dist/cli.js --help` works
- [ ] `node dist/cli.js` renders TUI correctly
- [ ] `node dist/cli.js --json` outputs valid JSON
- [ ] All subcommands work (skills, agents, etc.)

---

## Files Created/Modified

| File | Action |
|------|--------|
| `.npmignore` | CREATE |
| `README.md` | REPLACE |
| `package.json` | UPDATE version if needed |

---

## Post-Publish Validation

```bash
# Fresh install test
npm install -g cc-dashboard
cc-dashboard
cc-dashboard skills --json

# Check npm page
open https://www.npmjs.com/package/cc-dashboard
```
