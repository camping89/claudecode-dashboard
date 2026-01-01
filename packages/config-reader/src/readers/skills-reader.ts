// Skills configuration reader
import { readdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import type { Skill } from '@cc/types'
import { CLAUDE_PATHS } from '../paths'

// Parse SKILL.md frontmatter
function parseSkillFrontmatter(content: string): Partial<Skill> {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}

  const frontmatter = match[1]
  const result: Partial<Skill> = {}

  for (const line of frontmatter.split('\n')) {
    const [key, ...valueParts] = line.split(':')
    const value = valueParts.join(':').trim()

    if (key === 'name') result.name = value
    if (key === 'description') result.description = value
    if (key === 'allowed-tools') result.allowedTools = value.split(',').map(t => t.trim())
    if (key === 'model') result.model = value
  }

  return result
}

export async function readSkills(): Promise<Skill[]> {
  const skillsDir = CLAUDE_PATHS.userSkills()
  if (!existsSync(skillsDir)) return []

  try {
    const entries = await readdir(skillsDir, { withFileTypes: true })
    const skills: Skill[] = []

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const skillPath = join(skillsDir, entry.name, 'SKILL.md')
      if (!existsSync(skillPath)) continue

      try {
        const content = await readFile(skillPath, 'utf-8')
        const parsed = parseSkillFrontmatter(content)

        skills.push({
          name: parsed.name || entry.name,
          description: parsed.description,
          allowedTools: parsed.allowedTools,
          model: parsed.model,
          source: 'user',
          path: skillPath,
        })
      } catch {
        // Skip invalid skills
      }
    }

    return skills
  } catch {
    return []
  }
}
