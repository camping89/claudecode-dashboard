import { readdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import type { Plugin } from '../../types.js'
import { CLAUDE_PATHS } from '../paths.js'
import { logManager } from '../../log-manager.js'

interface PluginManifest {
  name: string
  version?: string
  description?: string
  commands?: string | string[]
  agents?: string | string[]
  skills?: string | string[]
  hooks?: string
  mcpServers?: string
}

export async function readPlugins(): Promise<Plugin[]> {
  const pluginsDir = CLAUDE_PATHS.userPlugins()
  if (!existsSync(pluginsDir)) return []

  try {
    const entries = await readdir(pluginsDir, { withFileTypes: true })
    const plugins: Plugin[] = []

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const pluginPath = join(pluginsDir, entry.name)
      const manifestPath = join(pluginPath, 'plugin.json')

      if (!existsSync(manifestPath)) continue

      try {
        const content = await readFile(manifestPath, 'utf-8')
        const manifest: PluginManifest = JSON.parse(content)

        const toArray = (v: string | string[] | undefined): string[] => {
          if (!v) return []
          return Array.isArray(v) ? v : [v]
        }

        plugins.push({
          name: manifest.name || entry.name,
          version: manifest.version,
          description: manifest.description,
          enabled: true,
          path: pluginPath,
          commands: toArray(manifest.commands),
          agents: toArray(manifest.agents),
          skills: toArray(manifest.skills),
          hooks: manifest.hooks ? [manifest.hooks] : [],
          mcpServers: manifest.mcpServers ? [manifest.mcpServers] : [],
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error'
        logManager.warn('plugins', `Failed to read plugin ${entry.name}: ${msg}`)
      }
    }

    return plugins
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    logManager.error('plugins', `Failed to read plugins directory: ${msg}`)
    return []
  }
}
