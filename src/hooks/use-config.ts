// Config loading hook - loads all Claude Code configurations
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
