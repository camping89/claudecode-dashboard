// Hooks configuration reader
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import type { Hook } from '../../types.js'
import { CLAUDE_PATHS } from '../paths.js'

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

export async function readHooks(): Promise<Hook[]> {
  const hooksDir = CLAUDE_PATHS.userHooks()
  const hooksFile = join(hooksDir, 'hooks.json')

  if (!existsSync(hooksFile)) return []

  try {
    const content = await readFile(hooksFile, 'utf-8')
    const config: HooksConfig = JSON.parse(content)
    const hooks: Hook[] = []

    for (const [eventName, eventConfigs] of Object.entries(config)) {
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
  } catch {
    return []
  }
}
