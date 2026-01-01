// Path utilities for Claude Code configuration files
import { homedir } from 'os'
import { join } from 'path'

export function getClaudeDir(): string {
  return join(homedir(), '.claude')
}

export function getClaudeJsonPath(): string {
  return join(homedir(), '.claude.json')
}

export const CLAUDE_PATHS = {
  userSettings: () => join(getClaudeDir(), 'settings.json'),
  userSettingsLocal: () => join(getClaudeDir(), 'settings.local.json'),
  userMemory: () => join(getClaudeDir(), 'CLAUDE.md'),
  userSkills: () => join(getClaudeDir(), 'skills'),
  userAgents: () => join(getClaudeDir(), 'agents'),
  userCommands: () => join(getClaudeDir(), 'commands'),
  userHooks: () => join(getClaudeDir(), 'hooks'),
  userOutputStyles: () => join(getClaudeDir(), 'output-styles'),
  userPlugins: () => join(getClaudeDir(), 'plugins'),
  metadata: () => join(getClaudeDir(), 'metadata.json'),
  history: () => join(getClaudeDir(), 'history.jsonl'),
  todos: () => join(getClaudeDir(), 'todos'),
  projects: () => join(getClaudeDir(), 'projects'),
  claudeJson: () => getClaudeJsonPath(),
}
