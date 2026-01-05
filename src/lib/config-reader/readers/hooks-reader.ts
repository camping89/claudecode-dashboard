import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import type { Hook } from '../../types.js'
import { CLAUDE_PATHS } from '../paths.js'
import { logManager } from '../../log-manager.js'

interface HooksConfig {
  [eventName: string]: Array<{
    matcher?: string
    hooks: Array<{
      type: 'command' | 'prompt'
      command?: string
      prompt?: string
      timeout?: number
    }>
  }>
}

interface SettingsWithHooks {
  hooks?: HooksConfig
}

export async function readHooks(): Promise<Hook[]> {
  const settingsPath = CLAUDE_PATHS.userSettings()

  if (!existsSync(settingsPath)) return []

  try {
    const content = await readFile(settingsPath, 'utf-8')
    const settings: SettingsWithHooks = JSON.parse(content)

    if (!settings.hooks) return []

    const hooks: Hook[] = []

    for (const [eventName, eventConfigs] of Object.entries(settings.hooks)) {
      for (const eventConfig of eventConfigs) {
        for (const hook of eventConfig.hooks) {
          hooks.push({
            event: eventName,
            matcher: eventConfig.matcher,
            type: hook.type,
            command: hook.command,
            prompt: hook.prompt,
            timeout: hook.timeout,
            source: 'user',
          })
        }
      }
    }

    return hooks
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    logManager.error('hooks', `Failed to parse hooks from settings: ${msg}`)
    return []
  }
}
