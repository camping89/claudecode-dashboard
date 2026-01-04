// @cc/types - Shared TypeScript type definitions for Claude Code Dashboard

// Config category types - all 21 categories
export type ConfigCategory =
  | 'settings'
  | 'memory'
  | 'skills'
  | 'agents'
  | 'commands'
  | 'plugins'
  | 'hooks'
  | 'mcp'
  | 'output-styles'
  | 'models'
  | 'environment'
  | 'permissions'
  | 'tools'
  | 'ide'
  | 'sessions'
  | 'enterprise'
  | 'todos'
  | 'metadata'
  | 'projects'
  | 'status-line'
  | 'authentication'

// API response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// Settings types
export interface ClaudeSettings {
  model?: string
  outputStyle?: string
  alwaysThinkingEnabled?: boolean
  permissions?: PermissionConfig
  sandbox?: SandboxConfig
  env?: Record<string, string>
}

export interface PermissionConfig {
  allow?: string[]
  ask?: string[]
  deny?: string[]
  additionalDirectories?: string[]
  defaultMode?: string
}

export interface SandboxConfig {
  enabled?: boolean
  autoAllowBashIfSandboxed?: boolean
  excludedCommands?: string[]
}

// Skill type
export interface Skill {
  name: string
  description?: string
  allowedTools?: string[]
  model?: string
  source: 'user' | 'project' | 'plugin'
  path: string
}

// Agent type
export interface Agent {
  name: string
  description?: string
  tools?: string[]
  model?: string
  permissionMode?: string
  skills?: string[]
  disallowedTools?: string[]
  source: 'user' | 'project' | 'plugin' | 'builtin'
  path: string
}

// Command type
export interface SlashCommand {
  name: string
  description?: string
  argumentHint?: string
  allowedTools?: string[]
  model?: string
  source: 'user' | 'project' | 'plugin' | 'builtin'
  path?: string
}

// Hook type
export interface Hook {
  event: string
  matcher?: string
  type: 'command' | 'prompt'
  command?: string
  prompt?: string
  timeout?: number
  source: 'user' | 'project' | 'plugin'
}

// MCP Server type
export interface McpServer {
  name: string
  type: 'http' | 'sse' | 'stdio'
  url?: string
  command?: string
  args?: string[]
  env?: Record<string, string>
  scope: 'user' | 'project' | 'managed'
}

// Plugin type
export interface Plugin {
  name: string
  version?: string
  description?: string
  enabled: boolean
  path: string
  commands?: string[]
  agents?: string[]
  skills?: string[]
  hooks?: string[]
  mcpServers?: string[]
}

// Output Style type
export interface OutputStyle {
  name: string
  description?: string
  source: 'user' | 'project' | 'plugin' | 'builtin'
  path?: string
}

// WebSocket message types
export interface WsMessage {
  type: 'config-update' | 'error' | 'ping'
  category?: ConfigCategory
  data?: unknown
  message?: string
}

// Dashboard state
export interface DashboardState {
  settings: ClaudeSettings | null
  skills: Skill[]
  agents: Agent[]
  commands: SlashCommand[]
  plugins: Plugin[]
  hooks: Hook[]
  mcpServers: McpServer[]
  outputStyles: OutputStyle[]
}
