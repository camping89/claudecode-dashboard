---
phase: 02
title: "Shared Packages"
status: pending
effort: 1.5h
dependencies: [phase-01]
---

# Phase 02: Shared Packages

## Context

- Parent: [plan.md](./plan.md)
- Depends on: [Phase 01](./phase-01-monorepo-scaffold.md)

---

## Overview

Create `@cc/types` and `@cc/config-reader` shared packages for cross-app usage.

---

## Implementation Steps

### 1. packages/types

#### packages/types/package.json

```json
{
  "name": "@cc/types",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

#### packages/types/src/index.ts

```typescript
// Config category types
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
  // ... other categories
}
```

### 2. packages/config-reader

#### packages/config-reader/package.json

```json
{
  "name": "@cc/config-reader",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "@cc/types": "workspace:*"
  }
}
```

#### packages/config-reader/src/index.ts

```typescript
export * from './paths'
export * from './readers/settings-reader'
export * from './readers/skills-reader'
export * from './readers/agents-reader'
export * from './readers/commands-reader'
export * from './readers/hooks-reader'
export * from './readers/mcp-reader'
export * from './readers/plugins-reader'
```

#### packages/config-reader/src/paths.ts

```typescript
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
```

#### packages/config-reader/src/readers/settings-reader.ts

```typescript
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
```

### 3. Create Stub Readers

Create similar reader files for each category:
- `readers/skills-reader.ts`
- `readers/agents-reader.ts`
- `readers/commands-reader.ts`
- `readers/hooks-reader.ts`
- `readers/mcp-reader.ts`
- `readers/plugins-reader.ts`

Each follows same pattern: check path exists, read file, parse, return typed data.

---

## Files to Create

| File | Purpose |
|------|---------|
| `packages/types/package.json` | Package manifest |
| `packages/types/src/index.ts` | Type definitions |
| `packages/config-reader/package.json` | Package manifest |
| `packages/config-reader/src/index.ts` | Exports |
| `packages/config-reader/src/paths.ts` | Path utilities |
| `packages/config-reader/src/readers/*.ts` | Reader functions |

---

## Verification

```bash
bun install
cd packages/types && bun run type-check
cd packages/config-reader && bun run type-check
```

---

## Success Criteria

- [ ] Types compile without errors
- [ ] Config reader imports types correctly
- [ ] Path utilities work on current OS
- [ ] Can import from workspace packages
