// Slash commands configuration reader
import { readdir, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import type { SlashCommand } from '../../types.js'
import { CLAUDE_PATHS } from '../paths.js'

// Parse command markdown frontmatter
function parseCommandFrontmatter(content: string): Partial<SlashCommand> {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return {}

  const frontmatter = match[1]
  const result: Partial<SlashCommand> = {}

  for (const line of frontmatter.split('\n')) {
    const [key, ...valueParts] = line.split(':')
    const value = valueParts.join(':').trim()

    if (key === 'description') result.description = value
    if (key === 'argument-hint') result.argumentHint = value
    if (key === 'allowed-tools') result.allowedTools = value.split(',').map(t => t.trim())
    if (key === 'model') result.model = value
  }

  return result
}

export async function readCommands(): Promise<SlashCommand[]> {
  const commandsDir = CLAUDE_PATHS.userCommands()
  if (!existsSync(commandsDir)) return []

  try {
    const files = await readdir(commandsDir, { recursive: true }) as string[]
    const commands: SlashCommand[] = []

    for (const file of files) {
      const filePath = String(file)
      if (!filePath.endsWith('.md')) continue

      const commandPath = join(commandsDir, filePath)

      try {
        const content = await readFile(commandPath, 'utf-8')
        const parsed = parseCommandFrontmatter(content)
        // Command name from file path (e.g., "ck/brainstorm.md" -> "ck:brainstorm")
        const name = filePath.replace(/\.md$/, '').replace(/[\/\\]/g, ':')

        commands.push({
          name,
          description: parsed.description,
          argumentHint: parsed.argumentHint,
          allowedTools: parsed.allowedTools,
          model: parsed.model,
          source: 'user',
          path: commandPath,
        })
      } catch {
        // Skip invalid commands
      }
    }

    return commands
  } catch {
    return []
  }
}
