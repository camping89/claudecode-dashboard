import { watch } from 'chokidar'
import type { ConfigCategory } from '@cc/types'
import {
  getClaudeDir,
  getClaudeJsonPath,
  readSettings,
  readSkills,
  readAgents,
  readCommands,
  readHooks,
  readMcpServers,
  readPlugins,
} from '@cc/config-reader'

type BroadcastFn = (category: ConfigCategory, data: unknown) => void

// Map file patterns to config categories and their readers
const categoryMap: Record<string, { category: ConfigCategory; reader: () => Promise<unknown> }> = {
  'settings.json': { category: 'settings', reader: readSettings },
  'settings.local.json': { category: 'settings', reader: readSettings },
  'skills': { category: 'skills', reader: readSkills },
  'agents': { category: 'agents', reader: readAgents },
  'commands': { category: 'commands', reader: readCommands },
  'hooks': { category: 'hooks', reader: readHooks },
  'plugins': { category: 'plugins', reader: readPlugins },
}

function getCategoryFromPath(path: string): { category: ConfigCategory; reader: () => Promise<unknown> } | null {
  // Check claude.json for MCP servers
  if (path.includes('.claude.json')) {
    return { category: 'mcp', reader: readMcpServers }
  }

  // Check other patterns
  for (const [pattern, config] of Object.entries(categoryMap)) {
    if (path.includes(pattern)) {
      return config
    }
  }
  return null
}

export function startWatcher(broadcast: BroadcastFn) {
  const claudeDir = getClaudeDir()
  const claudeJsonPath = getClaudeJsonPath()

  // Debounce to avoid rapid-fire updates
  const debounceMap = new Map<ConfigCategory, NodeJS.Timeout>()

  const handleChange = async (path: string) => {
    const match = getCategoryFromPath(path)
    if (!match) return

    const { category, reader } = match

    // Debounce by category
    const existing = debounceMap.get(category)
    if (existing) clearTimeout(existing)

    debounceMap.set(
      category,
      setTimeout(async () => {
        try {
          const data = await reader()
          broadcast(category, data)
          console.log(`[watcher] ${category} updated`)
        } catch (e) {
          console.error(`[watcher] Error reading ${category}:`, e)
        }
      }, 100)
    )
  }

  // Watch Claude directory and .claude.json
  const watcher = watch([claudeDir, claudeJsonPath], {
    ignoreInitial: true,
    persistent: true,
    depth: 3,
  })

  watcher
    .on('add', handleChange)
    .on('change', handleChange)
    .on('unlink', handleChange)

  console.log(`[watcher] Watching ${claudeDir} and ${claudeJsonPath}`)
}
