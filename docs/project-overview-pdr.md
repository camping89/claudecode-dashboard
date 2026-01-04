# CC Dashboard - Project Overview & Product Development Requirements

## Project Overview

**CC Dashboard** is a command-line interface (CLI) tool for viewing and managing Claude Code configurations. It provides developers with a read-only dashboard to inspect Claude Code settings, skills, agents, commands, plugins, hooks, and MCP server configurations stored in `~/.claude/`.

The project is transitioning from a monorepo structure (Turborepo with separate API and Web apps) to a focused CLI application leveraging modern Node.js tooling.

### Phase 1 Status: Complete
- Monorepo restructured to single CLI package
- Configuration readers implemented for all Claude Code config categories
- Type system defined for all supported configuration types
- CLI scaffold created (stub entry point)
- Build tooling configured (tsup for bundling)

### Phase 2 (Planned)
- Full TUI (Text User Interface) implementation using Ink + React
- Interactive CLI dashboard with real-time config viewing
- Color-coded output and formatted display of configurations

## Product Development Requirements (PDR)

### Functional Requirements

#### F1: Configuration Reading
- **F1.1**: Read and parse `~/.claude/settings.json` (settings config)
- **F1.2**: Read and parse `~/.claude/CLAUDE.md` (user memory/context)
- **F1.3**: Read and list all files from `~/.claude/skills/` directory
- **F1.4**: Read and list all files from `~/.claude/agents/` directory
- **F1.5**: Read and list all files from `~/.claude/commands/` directory
- **F1.6**: Read and list all files from `~/.claude/hooks/hooks.json`
- **F1.7**: Read and list all files from `~/.claude/plugins/` directory
- **F1.8**: Read and list all files from `~/.claude/output-styles/` directory
- **F1.9**: Extract MCP servers configuration from `~/.claude.json` → `mcpServers`
- **F1.10**: Support for extended config categories (21 total types)

#### F2: Type System
- **F2.1**: Define TypeScript interfaces for all configuration types
- **F2.2**: Support multiple config sources (user, project, plugin, builtin)
- **F2.3**: Define API response wrapper types
- **F2.4**: Define WebSocket message types for real-time updates

#### F3: CLI Interface
- **F3.1**: Implement executable CLI entry point (`cc-dashboard` command)
- **F3.2**: Support various output formats (text, JSON in Phase 2)
- **F3.3**: Handle errors gracefully with user-friendly messages

#### F4: Build & Distribution
- **F4.1**: Bundle CLI as single executable binary
- **F4.2**: Publish to npm with proper bin entry
- **F4.3**: Support Node.js 20+ runtime

### Non-Functional Requirements

#### NF1: Performance
- **NF1.1**: CLI startup time < 500ms
- **NF1.2**: Config parsing < 100ms for typical configurations
- **NF1.3**: Minimal dependency footprint

#### NF2: Reliability
- **NF2.1**: Gracefully handle missing config files
- **NF2.2**: Validate JSON parsing with error recovery
- **NF2.3**: No hard dependencies on Bun (works with Node.js)

#### NF3: Maintainability
- **NF3.1**: Modular reader architecture for each config type
- **NF3.2**: Centralized type definitions
- **NF3.3**: Clear separation of concerns (paths, readers, types, CLI)

#### NF4: Compatibility
- **NF4.1**: Support macOS, Linux, Windows
- **NF4.2**: Compatible with various Claude Code versions

### Acceptance Criteria

**Phase 1 Completion:**
- [ ] All 7 core config readers implemented and functional
- [ ] TypeScript types cover all 21 config categories
- [ ] CLI entry point created with proper shebang
- [ ] Build process generates standalone executable
- [ ] Project builds with tsup without errors
- [ ] TypeScript validation passes (`tsc --noEmit`)
- [ ] package.json includes proper bin entry

**Phase 2 Readiness:**
- [ ] Config readers tested and verified
- [ ] Type system validated against actual configs
- [ ] CLI framework (Commander.js) integrated
- [ ] React + Ink dependencies available
- [ ] Build output verified as executable

### Success Metrics

- **Adoption**: Number of developers using the dashboard
- **Startup Time**: CLI startup latency (target: <500ms)
- **Config Coverage**: Percentage of Claude Code configs supported (target: 100%)
- **Error Handling**: User-facing error messages for all failure scenarios
- **Documentation**: Comprehensive docs for extension/contribution

## Architecture Decisions

### Monorepo to Single Package
**Decision**: Migrate from Turborepo (apps/ + packages/) to single CLI package.

**Rationale**:
- Simplified dependency management
- Faster build times
- Reduced complexity for CLI-only use case
- Easier distribution and installation

**Trade-offs**:
- Loss of separate API/Web apps (reintroduced in future phases if needed)
- Single TypeScript target configuration

### Build Tool Selection: tsup
**Decision**: Use tsup for bundling instead of Turborepo scripts.

**Rationale**:
- Optimized for CLI/library bundling
- Tree-shaking and minification built-in
- Single command build process
- Proper shebang injection for CLI

### Dependencies
**Core**:
- `commander`: CLI argument parsing and help generation
- `react` + `ink`: TUI rendering (prepared for Phase 2)
- `@inkjs/ui`: Reusable TUI components

**Dev**:
- `tsup`: Build and bundling
- `tsx`: Type-aware TypeScript execution
- `typescript`: Type checking

## Configuration File Locations

| Category | Path | Type | Status |
|----------|------|------|--------|
| Settings | `~/.claude/settings.json` | JSON | Phase 1 |
| Settings Local | `~/.claude/settings.local.json` | JSON | Phase 1 |
| Memory | `~/.claude/CLAUDE.md` | Markdown | Phase 1 |
| Skills | `~/.claude/skills/` | Directory | Phase 1 |
| Agents | `~/.claude/agents/` | Directory | Phase 1 |
| Commands | `~/.claude/commands/` | Directory | Phase 1 |
| Hooks | `~/.claude/hooks/hooks.json` | JSON | Phase 1 |
| Plugins | `~/.claude/plugins/` | Directory | Phase 1 |
| Output Styles | `~/.claude/output-styles/` | Directory | Phase 1 |
| MCP Servers | `~/.claude.json` → `mcpServers` | JSON | Phase 1 |
| Metadata | `~/.claude/metadata.json` | JSON | Future |
| History | `~/.claude/history.jsonl` | JSONL | Future |
| Todos | `~/.claude/todos/` | Directory | Future |
| Projects | `~/.claude/projects/` | Directory | Future |

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 20+ |
| Language | TypeScript | 5.7+ |
| Build | tsup | 8.0+ |
| CLI Framework | Commander.js | 12.0+ |
| TUI | Ink + React | 5.0 + 18.3 |
| Package Manager | npm | Latest |

## File Structure

```
cc-dashboard/
├── src/
│   ├── cli.tsx                    # CLI entry point
│   └── lib/
│       ├── types.ts               # Shared type definitions
│       ├── config-reader/
│       │   ├── index.ts          # Public API exports
│       │   ├── paths.ts          # Path utilities
│       │   └── readers/
│       │       ├── settings-reader.ts
│       │       ├── skills-reader.ts
│       │       ├── agents-reader.ts
│       │       ├── commands-reader.ts
│       │       ├── hooks-reader.ts
│       │       ├── mcp-reader.ts
│       │       └── plugins-reader.ts
├── dist/                         # Compiled output
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── README.md
└── docs/
```

## Next Steps (Phase 2)

1. Implement interactive CLI with Commander.js
2. Build TUI components with Ink + React
3. Add real-time file watching with chokidar
4. Implement formatting and color output
5. Add support for configuration filtering and search
6. Create comprehensive help and documentation

## Version History

**v1.0.0** (Phase 1 - Current)
- Initial CLI package structure
- Core config readers for 7 main categories
- Complete TypeScript type system
- Build tooling configured

---

**Last Updated**: 2026-01-04
**Phase**: 1 - CLI Infrastructure
**Status**: Complete
