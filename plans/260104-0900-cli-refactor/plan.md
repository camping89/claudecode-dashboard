# Plan: CC Dashboard CLI Refactor

**Created:** 2026-01-04
**Status:** Complete
**Phase 1 Completed:** 2026-01-04 10:27
**All Phases Completed:** 2026-01-04
**Brainstorm:** [brainstorm-260104-0900-cli-refactor.md](../reports/brainstorm-260104-0900-cli-refactor.md)

---

## Overview

Refactor cc-dashboard from web app (Hono + Next.js) to CLI TUI using Ink + React. Goal: `npm i -g cc-dashboard` or `bun add -g cc-dashboard` for viewing Claude Code configs in terminal.

---

## Target Architecture

```
cc-dashboard/
├── src/
│   ├── cli.tsx                 # Entry point + CLI args
│   ├── app.tsx                 # Main TUI container
│   ├── components/
│   │   ├── layout.tsx          # Side panel layout
│   │   ├── category-menu.tsx   # Left: category list
│   │   ├── item-list.tsx       # Left: items in category
│   │   ├── detail-panel.tsx    # Right: item details
│   │   └── status-bar.tsx      # Bottom: keyboard hints
│   ├── hooks/
│   │   ├── use-config.ts       # Load all configs
│   │   └── use-navigation.ts   # Keyboard navigation state
│   └── lib/
│       ├── config-reader/      # Moved from packages/
│       │   ├── index.ts
│       │   ├── paths.ts
│       │   └── readers/
│       ├── types.ts            # Moved from packages/
│       └── json-output.ts      # --json mode formatter
├── dist/
│   ├── cli.js                  # tsup bundle (npm)
│   └── cc-dashboard            # bun binary
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

---

## Phases

| Phase | Description | Est. Files |
|-------|-------------|------------|
| 1 | [Cleanup & Project Setup](./phase-01-cleanup-setup.md) | 5 |
| 2 | [Core TUI Components](./phase-02-core-tui.md) | 6 |
| 3 | [Category Views](./phase-03-category-views.md) | 8 |
| 4 | [JSON Output & CLI Args](./phase-04-json-cli.md) | 3 |
| 5 | [Build & Publish](./phase-05-build-publish.md) | 3 |

---

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Keep config-reader logic | 7 readers already work, DRY |
| Ink + React | User knows React/Next.js, active ecosystem |
| Side panel at 120 cols | Power-user UX, list always visible |
| Commander.js for CLI | Simple, well-documented, one command |
| Dual build | tsup for npm, bun compile for bun users |

---

## Dependencies

```json
{
  "dependencies": {
    "ink": "^5.0.0",
    "@inkjs/ui": "^2.0.0",
    "react": "^18.3.0",
    "commander": "^12.0.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "@types/react": "^18.3.0",
    "typescript": "^5.7.0",
    "tsx": "^4.0.0"
  }
}
```

---

## Success Criteria

- [x] `npm i -g cc-dashboard && cc-dashboard` works
- [x] `bun add -g cc-dashboard && cc-dashboard` works
- [x] TUI renders at 120+ cols with side panel
- [x] Arrow keys navigate categories/items
- [x] `cc-dashboard --json` outputs valid JSON
- [x] Startup < 500ms
- [x] Bundle < 1MB (~532KB total)

---

## Risks

| Risk | Mitigation |
|------|------------|
| Ink Box layout limitations | Custom flexbox-like component |
| Terminal width detection | stdout.columns with fallback |
| ESM vs CJS issues | tsup handles both |
