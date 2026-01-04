# Phase 2: Core TUI Components

**Status:** Pending
**Estimated Files:** 6

---

## Objective

Build the core TUI shell: entry point, layout, navigation hooks.

---

## Tasks

### 2.1 Create Entry Point - `src/cli.tsx`

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
  .option('-j, --json', 'Output as JSON')
  .option('-c, --category <name>', 'Show specific category')
  .parse()

const opts = program.opts()

if (opts.json) {
  await printJsonOutput(opts.category)
} else {
  render(<App initialCategory={opts.category} />)
}
```

### 2.2 Create Main App - `src/app.tsx`

```tsx
import React from 'react'
import { Box, useApp, useInput, useStdout } from 'ink'
import { Layout } from './components/layout.js'
import { useConfig } from './hooks/use-config.js'
import { useNavigation } from './hooks/use-navigation.js'

interface AppProps {
  initialCategory?: string
}

export function App({ initialCategory }: AppProps) {
  const { exit } = useApp()
  const { stdout } = useStdout()
  const config = useConfig()
  const nav = useNavigation(config, initialCategory)

  useInput((input, key) => {
    if (input === 'q') exit()
    if (input === 'r') config.refresh()
    if (key.upArrow) nav.up()
    if (key.downArrow) nav.down()
    if (key.leftArrow) nav.left()
    if (key.rightArrow) nav.right()
    if (key.return) nav.select()
  })

  const width = stdout?.columns ?? 120

  if (width < 120) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="yellow">Terminal too narrow ({width} cols)</Text>
        <Text>Minimum 120 columns required for side panel view.</Text>
      </Box>
    )
  }

  if (config.loading) {
    return <Spinner label="Loading configurations..." />
  }

  return <Layout config={config.data} nav={nav} width={width} />
}
```

### 2.3 Create Layout - `src/components/layout.tsx`

```tsx
import React from 'react'
import { Box, Text } from 'ink'
import { CategoryMenu } from './category-menu.js'
import { ItemList } from './item-list.js'
import { DetailPanel } from './detail-panel.js'
import { StatusBar } from './status-bar.js'
import type { DashboardState } from '../lib/types.js'
import type { NavState } from '../hooks/use-navigation.js'

interface LayoutProps {
  config: DashboardState
  nav: NavState
  width: number
}

export function Layout({ config, nav, width }: LayoutProps) {
  const leftWidth = 30
  const rightWidth = width - leftWidth - 3 // borders

  return (
    <Box flexDirection="column" width={width}>
      {/* Header */}
      <Box borderStyle="single" paddingX={1}>
        <Text bold>CC Dashboard</Text>
        <Box flexGrow={1} />
        <Text dimColor>[q] Quit</Text>
      </Box>

      {/* Main content */}
      <Box height={20}>
        {/* Left panel */}
        <Box flexDirection="column" width={leftWidth} borderStyle="single">
          <CategoryMenu
            categories={nav.categories}
            selected={nav.categoryIndex}
            focused={nav.panel === 'category'}
          />
          <Box marginTop={1}>
            <ItemList
              items={nav.currentItems}
              selected={nav.itemIndex}
              focused={nav.panel === 'item'}
            />
          </Box>
        </Box>

        {/* Right panel */}
        <Box flexDirection="column" width={rightWidth} borderStyle="single">
          <DetailPanel item={nav.selectedItem} />
        </Box>
      </Box>

      {/* Status bar */}
      <StatusBar />
    </Box>
  )
}
```

### 2.4 Create useConfig Hook - `src/hooks/use-config.ts`

```typescript
import { useState, useEffect, useCallback } from 'react'
import {
  readSettings,
  readSkills,
  readAgents,
  readCommands,
  readHooks,
  readMcpServers,
  readPlugins,
} from '../lib/config-reader/index.js'
import type { DashboardState } from '../lib/types.js'

interface UseConfigReturn {
  data: DashboardState
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useConfig(): UseConfigReturn {
  const [data, setData] = useState<DashboardState>({
    settings: null,
    skills: [],
    agents: [],
    commands: [],
    plugins: [],
    hooks: [],
    mcpServers: [],
    outputStyles: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
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

      setData({
        settings,
        skills,
        agents,
        commands,
        plugins,
        hooks,
        mcpServers,
        outputStyles: [],
      })
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load config')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  return { data, loading, error, refresh: loadAll }
}
```

### 2.5 Create useNavigation Hook - `src/hooks/use-navigation.ts`

```typescript
import { useState, useMemo } from 'react'
import type { DashboardState, Skill, Agent, SlashCommand, Hook, McpServer, Plugin } from '../lib/types.js'

type Panel = 'category' | 'item'
type CategoryKey = 'skills' | 'agents' | 'commands' | 'hooks' | 'mcp' | 'plugins' | 'settings'

interface Category {
  key: CategoryKey
  label: string
  count: number
}

export interface NavState {
  panel: Panel
  categoryIndex: number
  itemIndex: number
  categories: Category[]
  currentItems: ConfigItem[]
  selectedItem: ConfigItem | null
  up: () => void
  down: () => void
  left: () => void
  right: () => void
  select: () => void
}

type ConfigItem = Skill | Agent | SlashCommand | Hook | McpServer | Plugin | { name: string; [k: string]: unknown }

export function useNavigation(config: { data: DashboardState }, initialCategory?: string): NavState {
  const [panel, setPanel] = useState<Panel>('category')
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [itemIndex, setItemIndex] = useState(0)

  const categories: Category[] = useMemo(() => [
    { key: 'skills', label: 'Skills', count: config.data.skills.length },
    { key: 'agents', label: 'Agents', count: config.data.agents.length },
    { key: 'commands', label: 'Commands', count: config.data.commands.length },
    { key: 'hooks', label: 'Hooks', count: config.data.hooks.length },
    { key: 'mcp', label: 'MCP Servers', count: config.data.mcpServers.length },
    { key: 'plugins', label: 'Plugins', count: config.data.plugins.length },
    { key: 'settings', label: 'Settings', count: config.data.settings ? 1 : 0 },
  ], [config.data])

  const currentItems = useMemo(() => {
    const cat = categories[categoryIndex]
    if (!cat) return []
    switch (cat.key) {
      case 'skills': return config.data.skills
      case 'agents': return config.data.agents
      case 'commands': return config.data.commands
      case 'hooks': return config.data.hooks
      case 'mcp': return config.data.mcpServers
      case 'plugins': return config.data.plugins
      case 'settings': return config.data.settings ? [{ name: 'Settings', ...config.data.settings }] : []
    }
  }, [config.data, categoryIndex, categories])

  const selectedItem = currentItems[itemIndex] ?? null

  return {
    panel,
    categoryIndex,
    itemIndex,
    categories,
    currentItems,
    selectedItem,
    up: () => {
      if (panel === 'category') {
        setCategoryIndex(i => Math.max(0, i - 1))
        setItemIndex(0)
      } else {
        setItemIndex(i => Math.max(0, i - 1))
      }
    },
    down: () => {
      if (panel === 'category') {
        setCategoryIndex(i => Math.min(categories.length - 1, i + 1))
        setItemIndex(0)
      } else {
        setItemIndex(i => Math.min(currentItems.length - 1, i + 1))
      }
    },
    left: () => setPanel('category'),
    right: () => setPanel('item'),
    select: () => {
      if (panel === 'category') setPanel('item')
    },
  }
}
```

### 2.6 Create StatusBar - `src/components/status-bar.tsx`

```tsx
import React from 'react'
import { Box, Text } from 'ink'

export function StatusBar() {
  return (
    <Box borderStyle="single" paddingX={1}>
      <Text dimColor>
        ↑↓ Navigate  ←→ Switch Panel  Enter Select  r Refresh  j JSON  q Quit
      </Text>
    </Box>
  )
}
```

---

## Validation

```bash
# Dev mode
bun run dev

# Should render TUI frame
```

---

## Files Created

| File | Purpose |
|------|---------|
| `src/cli.tsx` | Entry point |
| `src/app.tsx` | Main container |
| `src/components/layout.tsx` | Side panel layout |
| `src/components/status-bar.tsx` | Keyboard hints |
| `src/hooks/use-config.ts` | Config loading |
| `src/hooks/use-navigation.ts` | Navigation state |
