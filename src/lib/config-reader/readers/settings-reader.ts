import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import type { ClaudeSettings } from '../../types.js'
import { CLAUDE_PATHS } from '../paths.js'
import { logManager } from '../../log-manager.js'

export async function readSettings(): Promise<ClaudeSettings | null> {
  const path = CLAUDE_PATHS.userSettings()
  if (!existsSync(path)) return null

  try {
    const content = await readFile(path, 'utf-8')
    return JSON.parse(content)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    logManager.error('settings', `Failed to parse ${path}: ${msg}`)
    return null
  }
}

export async function readSettingsLocal(): Promise<ClaudeSettings | null> {
  const path = CLAUDE_PATHS.userSettingsLocal()
  if (!existsSync(path)) return null

  try {
    const content = await readFile(path, 'utf-8')
    return JSON.parse(content)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    logManager.error('settings', `Failed to parse local settings: ${msg}`)
    return null
  }
}
