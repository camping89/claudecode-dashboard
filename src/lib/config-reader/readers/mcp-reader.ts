// MCP servers configuration reader
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import type { McpServer } from '../../types.js'
import { CLAUDE_PATHS } from '../paths.js'

interface McpConfig {
  mcpServers?: {
    [name: string]: {
      type?: 'http' | 'sse' | 'stdio'
      url?: string
      command?: string
      args?: string[]
      env?: Record<string, string>
    }
  }
}

export async function readMcpServers(): Promise<McpServer[]> {
  const claudeJsonPath = CLAUDE_PATHS.claudeJson()

  if (!existsSync(claudeJsonPath)) return []

  try {
    const content = await readFile(claudeJsonPath, 'utf-8')
    const config: McpConfig = JSON.parse(content)

    if (!config.mcpServers) return []

    const servers: McpServer[] = []

    for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
      servers.push({
        name,
        type: serverConfig.type || (serverConfig.command ? 'stdio' : 'http'),
        url: serverConfig.url,
        command: serverConfig.command,
        args: serverConfig.args,
        env: serverConfig.env,
        scope: 'user',
      })
    }

    return servers
  } catch {
    return []
  }
}
