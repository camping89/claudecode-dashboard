# Brainstorm: CC Dashboard CLI Refactor

**Date:** 2026-01-04
**Status:** Agreed
**Participants:** User + Claude

---

## Problem Statement

Current `cc-dashboard` is a web-based monorepo (Hono API + Next.js frontend) for viewing Claude Code configurations. User wants to refactor to a **CLI TUI** installable via npm/bun for better developer ergonomics and simpler distribution.

---

## Requirements Gathered

| Requirement | Decision |
|-------------|----------|
| Primary UX | Interactive TUI (like k9s, lazygit) |
| Framework | Ink (React for CLI) + Ink UI components |
| Navigation | Arrow-key interactive menu |
| Detail View | Side panel (list left, details right) |
| Min Terminal | 120 columns |
| Output Modes | TUI default, `--json` for scripts |
| Build | Dual: bun binary + tsup for npm users |
| Real-time | On-demand refresh (no file watching) |
| Package Name | `cc-dashboard` |
| Repo Structure | Monorepo, remove web/api, keep packages/ |

---

## Evaluated Approaches

### Approach 1: Pure ANSI (chalk + commander)
**Pros:** Minimal deps, fast startup, works everywhere
**Cons:** No interactive TUI, basic output only
**Verdict:** ❌ Rejected - doesn't meet "rich TUI" requirement

### Approach 2: Blessed/neo-blessed
**Pros:** Powerful ncurses-style, lighter than React
**Cons:** Dated API, harder to maintain, less ecosystem
**Verdict:** ❌ Rejected - DX concerns

### Approach 3: Ink + Ink UI ✅ Selected
**Pros:** React paradigm (user knows Next.js), active ecosystem, theming, component reuse
**Cons:** ~500KB bundle, React runtime overhead
**Verdict:** ✅ Accepted - best balance of DX and capability

### Approach 4: Pastel Framework (Ink-based)
**Pros:** Next.js-like file routing, Zod options, auto-help generation
**Cons:** Another abstraction layer, may be overkill for single-command app
**Verdict:** 🤔 Optional - consider if subcommands grow complex

---

## Recommended Solution

### Architecture

```
cc-dashboard/
├── packages/
│   ├── types/           # Keep - shared TS types
│   └── config-reader/   # Keep - file parsing logic
├── src/                 # NEW - CLI source
│   ├── cli.tsx          # Entry point
│   ├── components/
│   │   ├── app.tsx      # Main TUI container
│   │   ├── menu.tsx     # Category navigation
│   │   ├── list-panel.tsx
│   │   ├── detail-panel.tsx
│   │   └── json-output.tsx
│   └── hooks/
│       └── use-config.ts
├── dist/                # Build outputs
│   ├── cli.js           # tsup bundle (npm)
│   └── cc-dashboard     # bun compile binary
├── package.json
└── tsconfig.json
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20+ / Bun 1.2+ |
| TUI Framework | Ink 5.x + Ink UI |
| CLI Parsing | Commander.js or Pastel |
| Type Safety | TypeScript 5.x + Zod |
| Build (npm) | tsup (esbuild wrapper) |
| Build (bun) | bun build --compile |

### Package.json Scripts

```json
{
  "name": "cc-dashboard",
  "version": "1.0.0",
  "bin": {
    "cc-dashboard": "./dist/cli.js"
  },
  "scripts": {
    "dev": "tsx src/cli.tsx",
    "build": "tsup src/cli.tsx --format esm",
    "build:bun": "bun build src/cli.tsx --compile --outfile dist/cc-dashboard"
  }
}
```

### UI Layout (120 cols)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  CC Dashboard                                                                                              [q] Quit │
├──────────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────┤
│  CATEGORIES                  │  DETAILS                                                                             │
│  ─────────────               │  ──────────                                                                          │
│  ▸ Skills (12)               │  Name: ui-ux-pro-max                                                                 │
│    Agents (5)                │  Source: user                                                                        │
│    Commands (8)              │  Path: ~/.claude/skills/ui-ux-pro-max.md                                             │
│    Hooks (3)                 │  Model: opus                                                                         │
│    MCP Servers (7)           │  Allowed Tools: Read, Write, WebSearch                                               │
│    Plugins (2)               │                                                                                      │
│    Settings                  │  Description:                                                                        │
│                              │  Frontend UI/UX design intelligence - activate FIRST when                           │
│  ─────────────               │  user requests beautiful, stunning, gorgeous, or aesthetic                           │
│  ITEMS                       │  interfaces...                                                                       │
│  ─────────────               │                                                                                      │
│  ▸ ui-ux-pro-max       user  │                                                                                      │
│    claude-code         user  │                                                                                      │
│    backend-dev         user  │                                                                                      │
│    mobile-dev          user  │                                                                                      │
│    ...                       │                                                                                      │
├──────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────┤
│  ↑↓ Navigate  ←→ Switch Panel  Enter Select  r Refresh  j JSON  q Quit                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Output Modes

```bash
# Interactive TUI (default)
cc-dashboard

# JSON output for scripting
cc-dashboard --json
cc-dashboard skills --json | jq '.[] | .name'

# Specific category
cc-dashboard skills
cc-dashboard mcp
```

---

## Implementation Considerations

### Reusable from Current Codebase
- `@cc/types` - All TypeScript interfaces
- `@cc/config-reader` - All file parsing logic (paths.ts, readers/*)

### To Remove
- `apps/web/` - Next.js frontend
- `apps/api/` - Hono backend
- WebSocket/chokidar real-time logic
- turbo.json (no longer needed for single package)

### New Dependencies
```json
{
  "dependencies": {
    "ink": "^5.0.0",
    "ink-ui": "^2.0.0",
    "react": "^18.3.0",
    "commander": "^12.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "@types/react": "^18.3.0",
    "typescript": "^5.7.0"
  }
}
```

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Ink doesn't support side panel well | Medium | High | Build custom Box-based layout |
| 120 cols too wide for some users | Low | Medium | Add graceful degradation message |
| React bundle size concerns | Low | Low | Tree-shaking via tsup |
| Bun binary portability issues | Low | Medium | tsup build as fallback |

---

## Success Metrics

1. **Startup time** < 500ms (cold start)
2. **Bundle size** < 1MB (tsup build)
3. **npm weekly downloads** > current web dashboard users
4. **GitHub stars** growth post-launch

---

## Validation Criteria

- [ ] `npm i -g cc-dashboard` works
- [ ] `bun add -g cc-dashboard` works
- [ ] TUI renders correctly at 120 cols
- [ ] All 8 config categories display correctly
- [ ] `--json` output is valid, pipe-able JSON
- [ ] Keyboard navigation works (↑↓←→, Enter, q)

---

## Next Steps

1. Remove `apps/web` and `apps/api`
2. Flatten monorepo (move packages/* to src/)
3. Set up Ink + React project structure
4. Implement menu navigation component
5. Implement side panel layout
6. Port each config category view
7. Add `--json` output mode
8. Configure dual build (tsup + bun)
9. Publish to npm

---

## Open Questions

None - all decisions made during brainstorm session.

---

## Sources

- [Ink - React for CLI](https://github.com/vadimdemedes/ink)
- [Ink UI Components](https://github.com/vadimdemedes/ink-ui)
- [Pastel - Next.js-like CLI Framework](https://github.com/vadimdemedes/pastel)
- [LogRocket Ink Tutorial](https://blog.logrocket.com/using-ink-ui-react-build-interactive-custom-clis/)
