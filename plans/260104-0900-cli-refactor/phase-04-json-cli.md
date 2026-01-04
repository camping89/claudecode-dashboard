# Phase 4: JSON Output & CLI Args

**Status:** Pending
**Estimated Files:** 2

---

## Objective

Implement `--json` flag for scriptable output and category-specific commands.

---

## Tasks

### 4.1 Create JSON Output Module - `src/lib/json-output.ts`

```typescript
import {
  readSettings,
  readSkills,
  readAgents,
  readCommands,
  readHooks,
  readMcpServers,
  readPlugins,
} from './config-reader/index.js'
import type { DashboardState } from './types.js'

type CategoryKey = 'skills' | 'agents' | 'commands' | 'hooks' | 'mcp' | 'plugins' | 'settings' | 'all'

export async function printJsonOutput(category?: string): Promise<void> {
  const cat = (category?.toLowerCase() ?? 'all') as CategoryKey

  try {
    const data = await loadCategory(cat)
    console.log(JSON.stringify(data, null, 2))
    process.exit(0)
  } catch (error) {
    console.error(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error',
    }))
    process.exit(1)
  }
}

async function loadCategory(cat: CategoryKey): Promise<unknown> {
  switch (cat) {
    case 'skills':
      return readSkills()
    case 'agents':
      return readAgents()
    case 'commands':
      return readCommands()
    case 'hooks':
      return readHooks()
    case 'mcp':
      return readMcpServers()
    case 'plugins':
      return readPlugins()
    case 'settings':
      return readSettings()
    case 'all':
    default:
      return loadAll()
  }
}

async function loadAll(): Promise<DashboardState> {
  const [settings, skills, agents, commands, hooks, mcpServers, plugins] =
    await Promise.all([
      readSettings(),
      readSkills(),
      readAgents(),
      readCommands(),
      readHooks(),
      readMcpServers(),
      readPlugins(),
    ])

  return {
    settings,
    skills,
    agents,
    commands,
    plugins,
    hooks,
    mcpServers,
    outputStyles: [],
  }
}
```

### 4.2 Update CLI Entry - `src/cli.tsx`

Enhance the CLI with subcommands for each category:

```tsx
#!/usr/bin/env node
import { render } from 'ink'
import { Command } from 'commander'
import React from 'react'
import { App } from './app.js'
import { printJsonOutput } from './lib/json-output.js'

const program = new Command()
  .name('cc-dashboard')
  .description('View Claude Code configurations')
  .version('1.0.0')

// Main command (interactive TUI)
program
  .option('-j, --json', 'Output all configs as JSON')
  .action(async (opts) => {
    if (opts.json) {
      await printJsonOutput('all')
    } else {
      render(<App />)
    }
  })

// Category subcommands
const categories = ['skills', 'agents', 'commands', 'hooks', 'mcp', 'plugins', 'settings']

for (const cat of categories) {
  program
    .command(cat)
    .description(`Show ${cat} configuration`)
    .option('-j, --json', 'Output as JSON')
    .action(async (opts) => {
      if (opts.json) {
        await printJsonOutput(cat)
      } else {
        render(<App initialCategory={cat} />)
      }
    })
}

program.parse()
```

---

## Usage Examples

```bash
# Interactive TUI
cc-dashboard

# JSON output (all)
cc-dashboard --json
cc-dashboard -j

# Category-specific
cc-dashboard skills
cc-dashboard skills --json
cc-dashboard mcp -j | jq '.[].name'

# Pipe-friendly
cc-dashboard agents --json | jq '.[] | select(.model == "opus")'
```

---

## Validation

```bash
# All JSON
cc-dashboard --json | jq 'keys'
# ["agents", "commands", "hooks", "mcpServers", "plugins", "settings", "skills"]

# Category JSON
cc-dashboard skills --json | jq 'length'

# Interactive with pre-selected category
cc-dashboard mcp
```

---

## Files Modified/Created

| File | Action |
|------|--------|
| `src/lib/json-output.ts` | CREATE |
| `src/cli.tsx` | MODIFY |
