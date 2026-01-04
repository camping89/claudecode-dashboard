# ClaudeCode Dashboard - System Architecture

## Architecture Overview

ClaudeCode Dashboard Phase 1 implements a modular CLI infrastructure for reading and managing Claude Code configurations. The architecture emphasizes separation of concerns, type safety, and extensibility.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLI Entry Point (cli.tsx)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│          Configuration Reader Module (config-reader/)       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Paths Module                 Reader Implementations        │
│  ├── getClaudeDir()          ├── readSettings()            │
│  ├── getClaudeJsonPath()     ├── readSkills()              │
│  └── CLAUDE_PATHS object     ├── readAgents()              │
│                              ├── readCommands()             │
│                              ├── readHooks()                │
│                              ├── readMcpServers()           │
│                              └── readPlugins()              │
│                                                             │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Type System (types.ts)                    │
├─────────────────────────────────────────────────────────────┤
│ • ConfigCategory (21 union types)                           │
│ • Configuration Interfaces (ClaudeSettings, Skill, etc.)    │
│ • API Response Wrapper Types                               │
│ • WebSocket Message Types                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│           File System & User Home Directory (~/.claude/)    │
└─────────────────────────────────────────────────────────────┘
```

## Layer Decomposition

### 1. CLI Entry Point Layer (src/cli.tsx)

**Purpose**: Main executable entry point for the CLI tool.

**Responsibilities**:
- Execute as command-line tool via npm bin entry
- Parse CLI arguments (Phase 2)
- Orchestrate configuration reading
- Render output/TUI (Phase 2)

**Current State (Phase 1)**:
- Stub implementation with console.log message
- Proper Node.js shebang for executable

**Phase 2 Integration Points**:
- Commander.js for argument parsing
- Integration with config readers
- Ink-based TUI rendering

### 2. Configuration Reader Module (src/lib/config-reader/)

**Purpose**: Abstracted layer for reading Claude Code configurations from the filesystem.

**Key Components**:

#### 2.1 Path Management (paths.ts)
```typescript
export function getClaudeDir(): string
export function getClaudeJsonPath(): string
export const CLAUDE_PATHS = { /* path definitions */ }
```

**Responsibilities**:
- Resolve home directory path
- Provide consistent path construction
- Single point of change for path modifications

**Path Map**:
| Config Type | Function | Path |
|-------------|----------|------|
| Settings | `userSettings()` | `~/.claude/settings.json` |
| Settings Local | `userSettingsLocal()` | `~/.claude/settings.local.json` |
| Memory | `userMemory()` | `~/.claude/CLAUDE.md` |
| Skills | `userSkills()` | `~/.claude/skills/` |
| Agents | `userAgents()` | `~/.claude/agents/` |
| Commands | `userCommands()` | `~/.claude/commands/` |
| Hooks | `userHooks()` | `~/.claude/hooks/` |
| Output Styles | `userOutputStyles()` | `~/.claude/output-styles/` |
| Plugins | `userPlugins()` | `~/.claude/plugins/` |
| MCP Servers | `claudeJson()` | `~/.claude.json` |

#### 2.2 Reader Implementations (readers/)
Each reader follows a consistent pattern:

**Common Pattern**:
```typescript
export async function readXXX(): Promise<XXXType | null> {
  const path = CLAUDE_PATHS.xxx()
  if (!existsSync(path)) return null

  try {
    const content = await readFile(path, 'utf-8')
    return JSON.parse(content)
  } catch {
    return null
  }
}
```

**Readers Implemented**:
1. **settings-reader.ts** - Reads settings.json, supports local overrides
2. **skills-reader.ts** - Lists skills from skills/ directory
3. **agents-reader.ts** - Lists agents from agents/ directory
4. **commands-reader.ts** - Lists commands from commands/ directory
5. **hooks-reader.ts** - Reads hooks configuration from hooks.json
6. **mcp-reader.ts** - Extracts MCP servers from .claude.json
7. **plugins-reader.ts** - Lists plugins from plugins/ directory

**Error Handling Strategy**:
- Missing files: Return null (graceful degradation)
- Parse errors: Catch exception, return null
- Invalid JSON: Handled by catch block
- Permission errors: Implicit (handled by catch)

**Async/Await Rationale**:
- Non-blocking file I/O
- Enables concurrent reads in Phase 2
- Proper TypeScript Promise types
- Ready for caching/memoization in future

### 3. Type System Layer (src/lib/types.ts)

**Purpose**: Single source of truth for all TypeScript type definitions.

**Type Categories**:

#### 3.1 Config Categories (21 types)
```typescript
type ConfigCategory =
  | 'settings' | 'memory' | 'skills' | 'agents' | 'commands'
  | 'plugins' | 'hooks' | 'mcp' | 'output-styles' | 'models'
  | 'environment' | 'permissions' | 'tools' | 'ide'
  | 'sessions' | 'enterprise' | 'todos' | 'metadata'
  | 'projects' | 'status-line' | 'authentication'
```

#### 3.2 Configuration Interfaces

**Settings** (ClaudeSettings):
```typescript
interface ClaudeSettings {
  model?: string
  outputStyle?: string
  alwaysThinkingEnabled?: boolean
  permissions?: PermissionConfig
  sandbox?: SandboxConfig
  env?: Record<string, string>
}
```

**Skills** (Skill):
```typescript
interface Skill {
  name: string
  description?: string
  allowedTools?: string[]
  model?: string
  source: 'user' | 'project' | 'plugin'
  path: string
}
```

**Agents** (Agent):
```typescript
interface Agent {
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
```

**Slash Commands** (SlashCommand):
```typescript
interface SlashCommand {
  name: string
  description?: string
  argumentHint?: string
  allowedTools?: string[]
  model?: string
  source: 'user' | 'project' | 'plugin' | 'builtin'
  path?: string
}
```

**Hooks** (Hook):
```typescript
interface Hook {
  event: string
  matcher?: string
  type: 'command' | 'prompt'
  command?: string
  prompt?: string
  timeout?: number
  source: 'user' | 'project' | 'plugin'
}
```

**MCP Servers** (McpServer):
```typescript
interface McpServer {
  name: string
  type: 'http' | 'sse' | 'stdio'
  url?: string
  command?: string
  args?: string[]
  env?: Record<string, string>
  scope: 'user' | 'project' | 'managed'
}
```

**Plugins** (Plugin):
```typescript
interface Plugin {
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
```

#### 3.3 Wrapper Types

**API Response**:
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}
```

**WebSocket Message**:
```typescript
interface WsMessage {
  type: 'config-update' | 'error' | 'ping'
  category?: ConfigCategory
  data?: unknown
  message?: string
}
```

**Dashboard State**:
```typescript
interface DashboardState {
  settings: ClaudeSettings | null
  skills: Skill[]
  agents: Agent[]
  commands: SlashCommand[]
  plugins: Plugin[]
  hooks: Hook[]
  mcpServers: McpServer[]
  outputStyles: OutputStyle[]
}
```

### 4. Filesystem & External Resources

**Claude Code Directory Structure**:
```
~/.claude/
├── settings.json           # User settings
├── settings.local.json     # Local environment overrides
├── CLAUDE.md              # User memory/context
├── skills/                # Custom skill definitions
├── agents/                # Custom agent definitions
├── commands/              # Custom command definitions
├── hooks/
│   └── hooks.json        # Hook event definitions
├── plugins/              # Plugin configurations
├── output-styles/        # Output style definitions
├── metadata.json         # Metadata (future)
├── history.jsonl         # History log (future)
├── todos/                # Todo items (future)
└── projects/             # Project configs (future)

~/.claude.json             # Global Claude config (MCP servers)
```

## Data Flow

### Configuration Read Flow (Phase 1)
```
User runs: claudecode-dashboard
    ↓
CLI entry point (cli.tsx) invoked
    ↓
Import config readers & types
    ↓
Call readers (e.g., readSettings(), readSkills())
    ↓
Each reader:
  1. Check if file/dir exists
  2. Read file content (fs/promises)
  3. Parse JSON
  4. Return typed data or null
    ↓
Stub implementation logs message
```

### Configuration Update Flow (Phase 2)
```
File system change detected by chokidar
    ↓
Trigger config reader for affected category
    ↓
Compare with cached state
    ↓
WebSocket broadcast to connected clients
    ↓
Frontend updates UI
```

## Design Patterns

### 1. Module Pattern
- **Path utilities module**: Single responsibility
- **Reader modules**: One reader per config type
- **Barrel export**: config-reader/index.ts re-exports all

### 2. Error Handling Pattern
- **Try/catch with null return**: Safe failure mode
- **Check existence first**: Avoid unnecessary reads
- **Silent degradation**: Missing files aren't errors

### 3. Type-Driven Development
- **Single type source**: All types in types.ts
- **Explicit type imports**: `import type { ... }`
- **TypeScript strict mode**: All checks enabled

### 4. Async Pattern
- **Promise-based APIs**: All readers return Promise<T | null>
- **Async/await syntax**: Modern, readable code
- **No callback hell**: Cleaner error handling

## Extensibility Points

### Phase 2: CLI Integration
```typescript
import { program } from 'commander'
import { readSettings, readSkills, readAgents, ... } from './lib/config-reader'

program
  .command('list <type>')
  .description('List configuration items')
  .action(async (type) => {
    // Use readers to fetch config
    // Format output
  })
```

### Phase 2: TUI Implementation
```typescript
import { render } from 'ink'
import Dashboard from './components/Dashboard'

// Integrate readers to provide data to components
const config = await readAllConfigs()
render(<Dashboard config={config} />)
```

### Future: Real-time Updates
```typescript
import chokidar from 'chokidar'

// Watch Claude directory
watcher.on('change', async (path) => {
  const type = determineConfigType(path)
  const updated = await readConfigByType(type)
  broadcastUpdate(updated)
})
```

### Future: Configuration Validation
```typescript
import { z } from 'zod'

// Add schema validation
const SettingsSchema = z.object({
  model: z.string().optional(),
  permissions: PermissionSchema,
  // ...
})
```

## Dependency Graph

```
cli.tsx
  ├── react (Phase 2)
  ├── ink (Phase 2)
  ├── commander (Phase 2)
  └── config-reader/index.ts
      ├── paths.ts
      ├── readers/
      │   ├── settings-reader.ts → types.ts
      │   ├── skills-reader.ts → types.ts
      │   ├── agents-reader.ts → types.ts
      │   ├── commands-reader.ts → types.ts
      │   ├── hooks-reader.ts → types.ts
      │   ├── mcp-reader.ts → types.ts
      │   └── plugins-reader.ts → types.ts
      └── paths.ts
            └── Node.js standard library (os, path, fs)
```

## Security Considerations

### Phase 1
- **File Permissions**: Respect system file permissions
- **Path Traversal**: Use OS-safe path utilities (no manual string concat)
- **JSON Parsing**: Safe JSON.parse in try/catch

### Phase 2+ Considerations
- **User Input Validation**: Validate CLI arguments
- **Sensitive Data**: Don't log API keys or tokens
- **File Watching**: Secure chokidar configuration
- **Sandboxing**: No arbitrary command execution

## Performance Characteristics

### Phase 1
- **Startup**: <100ms (pure file I/O)
- **Per-reader**: <50ms average (varies by file size)
- **Memory**: ~10-20MB typical (loaded configs)

### Phase 2 Targets
- **TUI Startup**: <500ms total
- **Concurrent reads**: Leverage async patterns
- **Caching**: Implement reader result caching
- **Lazy loading**: Load configs on-demand in TUI

## Testing Architecture (Planned)

### Unit Tests
- Individual reader functions
- Path utility functions
- Type validation

### Integration Tests
- Multi-reader workflows
- Error scenarios (missing files, corrupt JSON)
- File watching integration (Phase 2)

### E2E Tests
- Full CLI workflows
- TUI component interactions
- Real config files

## Monitoring & Observability

### Phase 2+
- **Error logging**: Structured error reporting
- **Performance metrics**: Timing for each operation
- **User telemetry**: Anonymous usage patterns (opt-in)
- **Debug mode**: Verbose logging with --debug flag

---

**Last Updated**: 2026-01-04
**Phase**: 1 - CLI Infrastructure
**Next Review**: Phase 2 implementation
