// JSON output module - outputs configs as JSON for scripting
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
