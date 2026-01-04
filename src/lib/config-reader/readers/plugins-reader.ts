// Plugins configuration reader
import { readdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import type { Plugin } from '../../types.js'
import { CLAUDE_PATHS } from '../paths.js'

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

        // Normalize arrays
        const toArray = (v: string | string[] | undefined): string[] => {
          if (!v) return []
          return Array.isArray(v) ? v : [v]
        }

        plugins.push({
          name: manifest.name || entry.name,
          version: manifest.version,
          description: manifest.description,
          enabled: true, // Would need to check settings for actual state
          path: pluginPath,
          commands: toArray(manifest.commands),
          agents: toArray(manifest.agents),
          skills: toArray(manifest.skills),
          hooks: manifest.hooks ? [manifest.hooks] : [],
          mcpServers: manifest.mcpServers ? [manifest.mcpServers] : [],
        })
      } catch {
        // Skip invalid plugins
      }
    }

    return plugins
  } catch {
    return []
  }
}
