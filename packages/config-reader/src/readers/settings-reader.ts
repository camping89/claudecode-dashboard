// Settings configuration reader
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import type { ClaudeSettings } from '@cc/types'
import { CLAUDE_PATHS } from '../paths'

export async function readSettings(): Promise<ClaudeSettings | null> {
  const path = CLAUDE_PATHS.userSettings()
  if (!existsSync(path)) return null

  try {
    const content = await readFile(path, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

export async function readSettingsLocal(): Promise<ClaudeSettings | null> {
  const path = CLAUDE_PATHS.userSettingsLocal()
  if (!existsSync(path)) return null

  try {
    const content = await readFile(path, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}
