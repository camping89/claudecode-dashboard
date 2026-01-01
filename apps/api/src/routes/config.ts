import { Hono } from 'hono'
import type { ApiResponse, DashboardState } from '@cc/types'
import {
  readSettings,
  readSkills,
  readAgents,
  readCommands,
  readHooks,
  readMcpServers,
  readPlugins,
} from '@cc/config-reader'

export const configRouter = new Hono()

// Helper for API responses
function respond<T>(data: T): ApiResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() }
}

function error(message: string): ApiResponse<never> {
  return { success: false, error: message, timestamp: new Date().toISOString() }
}

// Get all config at once
configRouter.get('/all', async (c) => {
  try {
    const [settings, skills, agents, commands, hooks, mcpServers, plugins] = await Promise.all([
      readSettings(),
      readSkills(),
      readAgents(),
      readCommands(),
      readHooks(),
      readMcpServers(),
      readPlugins(),
    ])

    const state: DashboardState = {
      settings,
      skills,
      agents,
      commands,
      plugins,
      hooks,
      mcpServers,
      outputStyles: [],
    }

    return c.json(respond(state))
  } catch (e) {
    return c.json(error(String(e)), 500)
  }
})

// Individual endpoints
configRouter.get('/settings', async (c) => {
  try {
    const data = await readSettings()
    return c.json(respond(data))
  } catch (e) {
    return c.json(error(String(e)), 500)
  }
})

configRouter.get('/skills', async (c) => {
  try {
    const data = await readSkills()
    return c.json(respond(data))
  } catch (e) {
    return c.json(error(String(e)), 500)
  }
})

configRouter.get('/agents', async (c) => {
  try {
    const data = await readAgents()
    return c.json(respond(data))
  } catch (e) {
    return c.json(error(String(e)), 500)
  }
})

configRouter.get('/commands', async (c) => {
  try {
    const data = await readCommands()
    return c.json(respond(data))
  } catch (e) {
    return c.json(error(String(e)), 500)
  }
})

configRouter.get('/hooks', async (c) => {
  try {
    const data = await readHooks()
    return c.json(respond(data))
  } catch (e) {
    return c.json(error(String(e)), 500)
  }
})

configRouter.get('/mcp', async (c) => {
  try {
    const data = await readMcpServers()
    return c.json(respond(data))
  } catch (e) {
    return c.json(error(String(e)), 500)
  }
})

configRouter.get('/plugins', async (c) => {
  try {
    const data = await readPlugins()
    return c.json(respond(data))
  } catch (e) {
    return c.json(error(String(e)), 500)
  }
})
