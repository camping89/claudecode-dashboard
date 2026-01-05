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
import { logManager } from '../lib/log-manager.js'

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
    logManager.info('config', 'Loading configurations...')
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
      logManager.info('config', `Loaded: ${skills.length} skills, ${agents.length} agents, ${commands.length} commands`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load config'
      logManager.error('config', `Load failed: ${msg}`)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  return { data, loading, error, refresh: loadAll }
}
