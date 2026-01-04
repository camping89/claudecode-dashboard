# CC Dashboard - Code Standards & Codebase Structure

## Codebase Structure

### Root Level Files
```
cc-dashboard/
├── package.json              # Project metadata and scripts
├── tsconfig.json            # TypeScript compiler configuration
├── tsup.config.ts           # Build configuration for tsup
├── README.md                # User-facing documentation
├── .gitignore              # Git ignore rules
├── bun.lock                # Lock file (optional, using npm)
├── src/                    # Source code (see below)
├── dist/                   # Compiled output (auto-generated)
├── node_modules/           # Dependencies
└── docs/                   # Documentation
```

### Source Directory Structure
```
src/
├── cli.tsx                 # CLI entry point with shebang
└── lib/
    ├── types.ts           # Shared TypeScript type definitions
    └── config-reader/     # Configuration reading module
        ├── index.ts       # Public API (barrel export)
        ├── paths.ts       # Path utilities for Claude config
        └── readers/       # Individual config readers
            ├── settings-reader.ts
            ├── skills-reader.ts
            ├── agents-reader.ts
            ├── commands-reader.ts
            ├── hooks-reader.ts
            ├── mcp-reader.ts
            └── plugins-reader.ts
```

## File Organization Patterns

### 1. Readers Pattern
Each config type has a dedicated reader module:
- **Single Responsibility**: Each reader handles one config category
- **Async Operations**: All readers use async/await for file I/O
- **Error Handling**: Graceful fallback to null on missing/invalid files
- **Type Safety**: Typed return values using interfaces from types.ts

**Example Pattern** (settings-reader.ts):
```typescript
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import type { ClaudeSettings } from '../../types.js'
import { CLAUDE_PATHS } from '../paths.js'

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
```

### 2. Path Utilities Pattern
Centralized path definitions prevent hardcoding and enable easy updates:
```typescript
export const CLAUDE_PATHS = {
  userSettings: () => join(getClaudeDir(), 'settings.json'),
  userSkills: () => join(getClaudeDir(), 'skills'),
  // ... other paths
}
```

### 3. Barrel Export Pattern
config-reader/index.ts re-exports all public APIs:
```typescript
export * from './paths.js'
export * from './readers/settings-reader.js'
// ... other readers
```

## TypeScript Configuration

**Target**: ES2022
**Module**: ESNext
**Resolution**: bundler
**Strict Mode**: Enabled (all strict checks active)

**Key Features**:
- `declaration: true` - Generate .d.ts files (disabled in build)
- `jsx: react-jsx` - New JSX transform
- `resolveJsonModule: true` - Import JSON files
- `isolatedModules: true` - Each file compiled independently

## Build Configuration (tsup)

**Format**: ESM only
**Target Runtime**: Node 20+
**Minification**: Enabled
**Tree-shaking**: Enabled
**Source Maps**: Disabled (CLI binary)

**Shebang Injection**:
```typescript
banner: {
  js: '#!/usr/bin/env node'
}
```
Allows `cc-dashboard` to be executed directly as command.

## Code Standards

### 1. Type Safety
- **Required**: TypeScript strict mode enabled
- **Pattern**: Export types as interfaces, not type aliases for complex objects
- **Naming**: Use PascalCase for types/interfaces, camelCase for variables
- **Imports**: Always use explicit `type` imports: `import type { Config } from './types'`

### 2. File Naming
- **Convention**: kebab-case for filenames (e.g., `config-reader.ts`)
- **Readers**: `-reader.ts` suffix for config readers
- **Types**: Centralized in `types.ts`
- **Utilities**: `-utils.ts` suffix or specific name

### 3. Import Statements
- **Path Style**: Use explicit .js extensions in imports (ESM compatibility)
- **Order**: Standard library → npm packages → local imports
- **Grouping**: Group related imports

```typescript
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import type { ClaudeSettings } from '../../types.js'
import { CLAUDE_PATHS } from '../paths.js'
```

### 4. Error Handling
- **Async Operations**: Use try/catch for file operations
- **Fallback Strategy**: Return null/empty arrays instead of throwing
- **User Experience**: Silent failures for missing files, logged errors for parsing

```typescript
try {
  const content = await readFile(path, 'utf-8')
  return JSON.parse(content)
} catch {
  return null  // Graceful degradation
}
```

### 5. Function Signatures
- **Async Pattern**: Use `async function` for operations requiring I/O
- **Return Types**: Always specify explicit return types
- **Parameters**: Use interfaces for complex parameter objects

```typescript
export async function readSettings(): Promise<ClaudeSettings | null> {
  // implementation
}
```

### 6. Code Comments
- **JSDoc**: Use for public APIs
- **Inline**: Sparingly, only for non-obvious logic
- **File Headers**: Optional, only for complex modules

```typescript
// Settings configuration reader
/**
 * Read user settings from ~/.claude/settings.json
 * @returns Parsed settings or null if file doesn't exist
 */
export async function readSettings(): Promise<ClaudeSettings | null>
```

## Type System

### Core Type Hierarchy
```
ConfigCategory (union of 21 types)
  ├── settings, skills, agents, commands
  ├── hooks, plugins, mcp, tools
  └── ... (see types.ts for complete list)

Configuration Interfaces
  ├── ClaudeSettings (root config object)
  ├── Skill, Agent, SlashCommand
  ├── Hook, Plugin, McpServer
  └── OutputStyle
```

### Type Export Pattern
All types exported from `src/lib/types.ts`:
- **Source Types**: The actual configuration objects from files
- **Wrapper Types**: ApiResponse<T> for API communication
- **Message Types**: WsMessage for WebSocket events
- **State Types**: DashboardState for application state

## Scripts & Commands

### Development
```bash
npm run dev          # Run CLI with tsx (development)
npm run build        # Build with tsup (production)
npm run type-check   # TypeScript validation
```

### Build Process
1. **Type Check**: `tsc --noEmit` validates all types
2. **Bundle**: `tsup` bundles src/cli.tsx to dist/cli.js
3. **Shebang**: Automatically injected by tsup
4. **Output**: Minified, tree-shaken, single-file executable

## Package.json Structure

**Key Entries**:
```json
{
  "name": "cc-dashboard",
  "type": "module",              // ESM only
  "bin": {
    "cc-dashboard": "./dist/cli.js"
  },
  "files": ["dist"],             // Only dist/ in npm package
  "scripts": {                   // Build and dev scripts
    "dev": "tsx src/cli.tsx",
    "build": "tsup",
    "type-check": "tsc --noEmit"
  },
  "engines": {
    "node": ">=20"               // Minimum Node version
  }
}
```

## Dependencies Management

### Production Dependencies
- `ink` - Terminal UI rendering
- `@inkjs/ui` - UI component library
- `react` - Component framework
- `commander` - CLI argument parsing (Phase 2)

### Dev Dependencies
- `tsup` - Build tool
- `tsx` - TypeScript executor
- `typescript` - Type checking
- `@types/*` - Type definitions

**Justification**:
- Minimal surface area (5 prod deps)
- All deps are actively maintained
- Ink/React chosen for Phase 2 TUI requirements

## Phase 1 Status

**Complete**:
- All readers implemented
- Types defined for 21 config categories
- CLI scaffold created
- Build tooling configured

**Stub Implementation**:
- CLI entry point prints message (Phase 2 full implementation)
- No interactive features yet
- Commander.js not yet integrated

## Phase 2 Expectations

**Code Changes Required**:
1. Implement CLI argument parsing with Commander.js
2. Create React components using Ink
3. Add real-time file watching (chokidar)
4. Implement output formatting and colors
5. Add filtering and search capabilities

**Structure Preserved**:
- Readers remain unchanged
- Types extended for new features
- Same build/dev process

## Testing Strategy (Planned)

**Phase 2 Focus Areas**:
- Unit tests for each reader
- Integration tests for CLI argument parsing
- E2E tests for full TUI workflows
- Type validation tests

## Documentation Standards

- **Inline**: Comments for non-obvious code sections
- **Files**: Markdown in docs/ directory
- **README**: User-facing quick start guide
- **Architecture**: system-architecture.md explains design decisions

## Code Review Checklist

Before committing:
- [ ] `npm run type-check` passes without errors
- [ ] All imports use explicit .js extensions
- [ ] Error handling includes try/catch where needed
- [ ] New types added to types.ts (centralized)
- [ ] New readers follow existing pattern
- [ ] No hardcoded paths (use CLAUDE_PATHS)
- [ ] Async functions have explicit Promise return types
- [ ] All public APIs documented

---

**Last Updated**: 2026-01-04
**Phase**: 1 - CLI Infrastructure
