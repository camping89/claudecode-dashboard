// Agents configuration reader
import { readdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import type { Agent } from '../../types.js'
import { CLAUDE_PATHS } from '../paths.js'

// Parse agent markdown frontmatter
function parseAgentFrontmatter(content: string): Partial<Agent> {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}

  const frontmatter = match[1]
  const result: Partial<Agent> = {}

  for (const line of frontmatter.split('\n')) {
    const [key, ...valueParts] = line.split(':')
    const value = valueParts.join(':').trim()

    if (key === 'name') result.name = value
    if (key === 'description') result.description = value
    if (key === 'tools') result.tools = value.split(',').map(t => t.trim())
    if (key === 'model') result.model = value
    if (key === 'permissionMode') result.permissionMode = value
    if (key === 'skills') result.skills = value.split(',').map(s => s.trim())
  }

  return result
}

export async function readAgents(): Promise<Agent[]> {
  const agentsDir = CLAUDE_PATHS.userAgents()
  if (!existsSync(agentsDir)) return []

  try {
    const files = await readdir(agentsDir)
    const agents: Agent[] = []

    for (const file of files) {
      if (!file.endsWith('.md')) continue

      const agentPath = join(agentsDir, file)

      try {
        const content = await readFile(agentPath, 'utf-8')
        const parsed = parseAgentFrontmatter(content)
        const name = parsed.name || file.replace('.md', '')

        agents.push({
          name,
          description: parsed.description,
          tools: parsed.tools,
          model: parsed.model,
          permissionMode: parsed.permissionMode,
          skills: parsed.skills,
          source: 'user',
          path: agentPath,
        })
      } catch {
        // Skip invalid agents
      }
    }

    return agents
  } catch {
    return []
  }
}
