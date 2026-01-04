// Navigation state hook - manages category/item selection and keyboard nav
import { useState, useMemo } from 'react'
import type { DashboardState, Skill, Agent, SlashCommand, Hook, McpServer, Plugin } from '../lib/types.js'

type Panel = 'category' | 'item'
type CategoryKey = 'skills' | 'agents' | 'commands' | 'hooks' | 'mcp' | 'plugins' | 'settings'

interface Category {
  key: CategoryKey
  label: string
  count: number
}

type ConfigItem = Skill | Agent | SlashCommand | Hook | McpServer | Plugin | { name: string; [k: string]: unknown }

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

export function useNavigation(config: { data: DashboardState }, initialCategory?: string): NavState {
  const [panel, setPanel] = useState<Panel>('category')
  const [categoryIndex, setCategoryIndex] = useState(() => {
    if (!initialCategory) return 0
    const idx = ['skills', 'agents', 'commands', 'hooks', 'mcp', 'plugins', 'settings'].indexOf(initialCategory)
    return idx >= 0 ? idx : 0
  })
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

  const currentItems = useMemo((): ConfigItem[] => {
    const cat = categories[categoryIndex]
    if (!cat) return []
    switch (cat.key) {
      case 'skills': return config.data.skills
      case 'agents': return config.data.agents
      case 'commands': return config.data.commands
      case 'hooks': return config.data.hooks.map(h => ({ ...h, name: `${h.event}${h.matcher ? `:${h.matcher}` : ''}` }))
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
