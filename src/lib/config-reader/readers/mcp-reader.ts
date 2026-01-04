// MCP servers configuration reader
// Reads from ~/.mcp.json (user-level) and ./.mcp.json (project-level)
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import type { McpServer } from '../../types.js'

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
  const servers: McpServer[] = []

  // Read user-level ~/.mcp.json
  const userMcpPath = join(homedir(), '.mcp.json')
  if (existsSync(userMcpPath)) {
    try {
      const content = await readFile(userMcpPath, 'utf-8')
      const config: McpConfig = JSON.parse(content)
      if (config.mcpServers) {
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
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Read project-level ./.mcp.json
  const projectMcpPath = join(process.cwd(), '.mcp.json')
  if (existsSync(projectMcpPath)) {
    try {
      const content = await readFile(projectMcpPath, 'utf-8')
      const config: McpConfig = JSON.parse(content)
      if (config.mcpServers) {
        for (const [name, serverConfig] of Object.entries(config.mcpServers)) {
          servers.push({
            name,
            type: serverConfig.type || (serverConfig.command ? 'stdio' : 'http'),
            url: serverConfig.url,
            command: serverConfig.command,
            args: serverConfig.args,
            env: serverConfig.env,
            scope: 'project',
          })
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  return servers
}
