# ClaudeCode Dashboard - Codebase Summary

## Project Overview
ClaudeCode Dashboard is a Node.js CLI tool for viewing Claude Code configurations from the filesystem. Phase 1 establishes the infrastructure: configuration readers, type system, and build tooling.

**Status**: Phase 1 Complete
**Runtime**: Node.js 20+
**Build Tool**: tsup
**Language**: TypeScript + React (TSX)

## Repository Structure

```
claudecode-dashboard/
├── src/
│   ├── cli.tsx                              # CLI entry point (stub - Phase 1)
│   └── lib/
│       ├── types.ts                         # Shared TypeScript types (21 categories)
│       └── config-reader/
│           ├── index.ts                     # Barrel export of readers
│           ├── paths.ts                     # Path utilities
│           └── readers/
│               ├── settings-reader.ts       # Settings config reader
│               ├── skills-reader.ts         # Skills directory reader
│               ├── agents-reader.ts         # Agents directory reader
│               ├── commands-reader.ts       # Commands directory reader
│               ├── hooks-reader.ts          # Hooks JSON reader
│               ├── mcp-reader.ts           # MCP servers from .claude.json
│               └── plugins-reader.ts        # Plugins directory reader
├── dist/                                    # Compiled output (auto-generated)
├── package.json                             # Project metadata & dependencies
├── tsconfig.json                            # TypeScript configuration
├── tsup.config.ts                          # Build configuration
├── README.md                                # User documentation
└── docs/                                    # Documentation (new - Phase 1)
    ├── project-overview-pdr.md             # PDR & project overview
    ├── code-standards.md                   # Code standards & patterns
    ├── system-architecture.md              # Architecture documentation
    └── codebase-summary.md                 # This file
```

## Key Features

### Configuration Readers (7 types)
1. **Settings Reader** - Parses `~/.claude/settings.json` and `settings.local.json`
2. **Skills Reader** - Lists `~/.claude/skills/` directory
3. **Agents Reader** - Lists `~/.claude/agents/` directory
4. **Commands Reader** - Lists `~/.claude/commands/` directory
5. **Hooks Reader** - Parses `~/.claude/hooks/hooks.json`
6. **MCP Reader** - Extracts MCP servers from `~/.claude.json`
7. **Plugins Reader** - Lists `~/.claude/plugins/` directory

### Type System (21 categories)
Core types: `settings`, `skills`, `agents`, `commands`, `hooks`, `plugins`, `mcp`, `output-styles`

Extended types: `models`, `environment`, `permissions`, `tools`, `ide`, `sessions`, `enterprise`, `todos`, `metadata`, `projects`, `status-line`, `authentication`, `memory`

### Build Pipeline
- **Dev**: `tsx` for type-aware TypeScript execution
- **Build**: `tsup` with minification, tree-shaking, and shebang injection
- **Type Check**: `tsc --noEmit` for validation
- **Output**: Single Node.js binary with `#!/usr/bin/env node` shebang

## Module Breakdown

### src/cli.tsx (5 lines)
CLI entry point. Currently a stub logging a Phase 1 completion message. Phase 2 will integrate:
- Commander.js for argument parsing
- Ink + React for TUI rendering
- Config reader integration

```typescript
console.log('claudecode-dashboard: CLI entry point created. Run Phase 2 for full TUI.')
```

### src/lib/types.ts (156 lines)
Complete TypeScript type definitions:

**Type Aliases**:
- `ConfigCategory` (21 union types)

**Core Interfaces**:
- `ClaudeSettings` - Settings configuration
- `Skill` - Skill definition with source tracking
- `Agent` - Agent with tools and permissions
- `SlashCommand` - Slash command definition
- `Hook` - Event hooks with triggers
- `McpServer` - MCP server configuration
- `Plugin` - Plugin with metadata
- `OutputStyle` - Output formatting style

**Wrapper Interfaces**:
- `ApiResponse<T>` - API response envelope
- `WsMessage` - WebSocket message format
- `DashboardState` - Full dashboard state

**Supporting Interfaces**:
- `PermissionConfig` - Permission settings
- `SandboxConfig` - Sandbox configuration

### src/lib/config-reader/paths.ts (29 lines)
Path utility module. Provides:
- `getClaudeDir()` - Resolve `~/.claude` directory
- `getClaudeJsonPath()` - Resolve `~/.claude.json` path
- `CLAUDE_PATHS` object - Mapping of all config paths

All paths computed using Node.js `os.homedir()` and `path.join()`.

### src/lib/config-reader/readers/ (Directory)
Seven reader modules, each following the same pattern:

**Pattern** (30 lines per file average):
1. Import fs/promises and types
2. Check file/directory existence
3. Read and parse content
4. Return typed result or null on error

**Files**:
- `settings-reader.ts` - Reads JSON settings with local override support
- `skills-reader.ts` - Lists directory and returns Skill array
- `agents-reader.ts` - Lists directory and returns Agent array
- `commands-reader.ts` - Lists directory and returns SlashCommand array
- `hooks-reader.ts` - Reads JSON hooks file
- `mcp-reader.ts` - Extracts from ~/.claude.json's mcpServers field
- `plugins-reader.ts` - Lists directory and returns Plugin array

All readers:
- Return `Promise<Type | null>`
- Check existence before reading
- Use try/catch for graceful error handling
- Silently return null on missing/corrupt files

### src/lib/config-reader/index.ts (10 lines)
Barrel export. Re-exports:
- All seven readers from readers/
- Path utilities from paths.ts

Provides clean public API: `import { readSettings, CLAUDE_PATHS } from '@cc/config-reader'`

## Dependencies

### Production
- `react` (18.3.0) - Component framework
- `ink` (5.0.0) - Terminal UI renderer
- `@inkjs/ui` (2.0.0) - Pre-built UI components
- `commander` (12.0.0) - CLI argument parser

### Development
- `tsup` (8.0.0) - Build bundler
- `tsx` (4.0.0) - TypeScript executor
- `typescript` (5.7.0) - Type checker
- `@types/react` (18.3.0) - React type definitions
- `@types/node` (22.0.0) - Node.js type definitions

**Minimal footprint**: 5 production dependencies focused on CLI/TUI needs.

## Configuration

### tsconfig.json
- **Target**: ES2022
- **Module**: ESNext (for tsup bundling)
- **Strict**: All strict checks enabled
- **JSX**: react-jsx (new transform)
- **Module Resolution**: bundler (optimized for bundling)

### tsup.config.ts
- **Format**: ESM only
- **Target Runtime**: node20
- **Minification**: Enabled
- **Tree-shaking**: Enabled
- **Shebang**: `#!/usr/bin/env node` (makes output executable)
- **External**: None (bundles all dependencies)
- **NoExternal**: All deps bundled (`/.*/`)

### package.json
- **Type**: module (ESM)
- **Bin**: `claudecode-dashboard` / `ccd` → `./dist/cli.js`
- **Files**: Only dist/ included in npm package
- **Engines**: node >=20

## Build Process

1. **Development**: `npm run dev` executes `tsx src/cli.tsx` (type-aware)
2. **Production Build**: `npm run build` runs tsup
   - Bundles src/cli.tsx
   - Injects shebang
   - Minifies output
   - Outputs to dist/cli.js
3. **Type Check**: `npm run type-check` validates types

**Output**: Single, executable JavaScript file with all dependencies bundled.

## Code Patterns

### Reader Pattern
Each reader follows the same structure:
```typescript
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import type { ConfigType } from '../../types.js'
import { CLAUDE_PATHS } from '../paths.js'

export async function readConfig(): Promise<ConfigType | null> {
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

### Path Utilities Pattern
Centralized path definitions:
```typescript
export const CLAUDE_PATHS = {
  userSettings: () => join(getClaudeDir(), 'settings.json'),
  userSkills: () => join(getClaudeDir(), 'skills'),
  // ... more paths
}
```

### Type Import Pattern
Explicit type imports for clarity:
```typescript
import type { ClaudeSettings } from '../../types.js'
```

## Execution Flow

1. CLI invoked: `claudecode-dashboard` or `ccd` (from npm bin)
2. Shebang routed to Node.js
3. Executes bundled dist/cli.js
4. Current output: Phase 1 message (placeholder)
5. Phase 2 will:
   - Parse CLI arguments
   - Read configurations
   - Render TUI
   - Handle user interactions

## Testing Coverage (Phase 2)

Planned test strategy:
- Unit tests for individual readers
- Integration tests for reader orchestration
- E2E tests for full CLI workflows
- Type validation tests

## Documentation

### Included Files
- `README.md` - User-facing quick start
- `docs/project-overview-pdr.md` - PDR and requirements
- `docs/code-standards.md` - Code style and patterns
- `docs/system-architecture.md` - Architecture deep dive
- `docs/codebase-summary.md` - This document

## Known Limitations (Phase 1)

- CLI is stub (prints message)
- No actual config reading in runtime
- No TUI implementation
- No real-time file watching
- No filtering or search
- No output formatting

All addressed in Phase 2.

## Phase 2 Plans

### Immediate (CLI Integration)
- Integrate Commander.js argument parsing
- Connect readers to CLI commands
- Add help text and usage documentation

### Next (TUI Implementation)
- Implement React components with Ink
- Display configurations in formatted output
- Add interactive selection/navigation

### Future (Advanced Features)
- Real-time file watching with chokidar
- WebSocket for client-server architecture
- Search and filtering capabilities
- Configuration validation and editing
- Plugin architecture

## Code Quality

- **TypeScript**: Strict mode enabled, all checks active
- **Linting**: Standards defined in code-standards.md
- **Build**: Minified, tree-shaken, single binary
- **Error Handling**: Graceful degradation pattern throughout

## Total Lines of Code

- `cli.tsx` - 2 (stub)
- `types.ts` - 156
- `paths.ts` - 29
- `settings-reader.ts` - 30
- `skills-reader.ts` - ~25
- `agents-reader.ts` - ~25
- `commands-reader.ts` - ~25
- `hooks-reader.ts` - ~25
- `mcp-reader.ts` - ~25
- `plugins-reader.ts` - ~25
- `index.ts` - 10

**Total**: ~375 lines of production code (excluding comments)

---

**Last Updated**: 2026-01-04
**Phase**: 1 - Complete
**Next Phase**: Phase 2 - TUI Implementation
