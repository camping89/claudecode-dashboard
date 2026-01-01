---
title: "Claude Code Configuration Dashboard"
description: "Read-only dashboard displaying all Claude Code configs with real-time updates"
status: pending
priority: P1
effort: 12h
branch: main
tags: [dashboard, bun, hono, nextjs, turborepo, shadcn]
created: 2026-01-01
---

# Claude Code Configuration Dashboard - Implementation Plan

## Overview

Build comprehensive read-only dashboard to display all 21 Claude Code configuration categories with real-time file watching.

**Tech Stack:**
- Runtime: Bun 1.2+
- Backend: Hono (port 4173)
- Frontend: Next.js 16 + React 19
- Styling: Tailwind CSS + shadcn/ui
- Monorepo: Turborepo + Bun workspaces
- Real-time: WebSocket (native Bun)

## References

- [Brainstorm Report](../reports/brainstorm-260101-1354-cc-dashboard.md)
- [Research: Bun + Hono + Turborepo](./research/researcher-01-bun-hono-turborepo.md)
- [Research: Next.js 16 + shadcn/ui](./research/researcher-02-nextjs-shadcn.md)

---

## Implementation Phases

| Phase | Name | Effort | Status | File |
|-------|------|--------|--------|------|
| 01 | Monorepo Scaffold | 1.5h | ✅ done | [phase-01-monorepo-scaffold.md](./phase-01-monorepo-scaffold.md) |
| 02 | Shared Packages | 1.5h | pending | [phase-02-shared-packages.md](./phase-02-shared-packages.md) |
| 03 | API Backend | 3h | pending | [phase-03-api-backend.md](./phase-03-api-backend.md) |
| 04 | Frontend Shell | 2h | pending | [phase-04-frontend-shell.md](./phase-04-frontend-shell.md) |
| 05 | Config Sections | 3h | pending | [phase-05-config-sections.md](./phase-05-config-sections.md) |
| 06 | Real-time & Polish | 1h | pending | [phase-06-realtime-polish.md](./phase-06-realtime-polish.md) |

---

## Architecture

```
cc-dashboard/
├── apps/
│   ├── web/                     # Next.js 16 frontend
│   │   ├── src/
│   │   │   ├── app/             # App Router pages
│   │   │   ├── components/      # UI components
│   │   │   ├── hooks/           # Custom hooks (useWebSocket, useConfig)
│   │   │   └── lib/             # Utilities
│   │   └── next.config.ts
│   └── api/                     # Hono backend
│       ├── src/
│       │   ├── routes/          # API endpoints by category
│       │   ├── services/        # Config readers
│       │   └── index.ts         # Entry + WebSocket
│       └── package.json
├── packages/
│   ├── types/                   # @cc/types - Shared TypeScript types
│   └── config-reader/           # @cc/config-reader - Parse logic
├── package.json                 # Workspace root
├── turbo.json                   # Pipeline config
└── tsconfig.json                # Base TypeScript config
```

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| File watching | **chokidar** | User preference, cross-platform reliability |
| WebSocket | Hono `upgradeWebSocket` + Bun pub/sub | Zero deps, topic-based broadcasting |
| Config path | `~/.claude/` default | User scope, CLI arg to override |
| Credentials | `[REDACTED]` placeholder | Security, no mask toggle |
| Empty sections | Show with "Not configured" | Senior dev visibility |
| Page routing | **Dynamic `[category]/page.tsx`** | One route, less files, param-based |

---

## Success Criteria

- [ ] All 21 config categories displayed
- [ ] Real-time updates via WebSocket
- [ ] Search across all sections
- [ ] JSON syntax highlighting
- [ ] Dark/light theme toggle
- [ ] Loads < 2 seconds
- [ ] Works on Windows/macOS/Linux

---

## Risks

| Risk | Mitigation |
|------|------------|
| Large metadata.json (200KB+) | Lazy load, paginate in UI |
| Path differences Win/Unix | Use `os.homedir()` + `path.join()` |
| WebSocket reconnection | Auto-reconnect with exponential backoff |

---

## Unresolved Questions

1. Multiple config profiles (home vs work)? → Defer to v2
2. Export to JSON/Markdown? → Nice-to-have, add if time permits
