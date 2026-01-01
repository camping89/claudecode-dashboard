---
phase: 05
title: "Config Sections"
status: pending
effort: 3h
dependencies: [phase-04]
---

# Phase 05: Config Sections (All 21 Categories)

## Context

- Parent: [plan.md](./plan.md)
- Depends on: [Phase 04](./phase-04-frontend-shell.md)
- Reference: [Brainstorm - 21 Categories](../reports/brainstorm-260101-1354-cc-dashboard.md)

---

## Overview

Implement all 21 configuration category pages with search, JSON highlighting, and collapsible sections.

---

## Shared Components

### apps/web/src/components/json-viewer.tsx

```tsx
"use client"

import SyntaxHighlighter from "react-syntax-highlighter"
import { atomOneDark, atomOneLight } from "react-syntax-highlighter/dist/esm/styles/hljs"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface JsonViewerProps {
  data: unknown
  maxHeight?: string
}

export function JsonViewer({ data, maxHeight = "400px" }: JsonViewerProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => setMounted(true), [])

  const json = JSON.stringify(data, null, 2)
  const style = mounted && theme === "dark" ? atomOneDark : atomOneLight

  return (
    <div className="rounded-md overflow-hidden" style={{ maxHeight }}>
      <SyntaxHighlighter
        language="json"
        style={style}
        customStyle={{ margin: 0, fontSize: "13px" }}
        showLineNumbers
      >
        {json}
      </SyntaxHighlighter>
    </div>
  )
}
```

### apps/web/src/components/search-input.tsx

```tsx
"use client"

import { Input } from "@/components/ui/input"
import { useState } from "react"

interface SearchInputProps {
  placeholder?: string
  onSearch: (query: string) => void
}

export function SearchInput({ placeholder = "Search...", onSearch }: SearchInputProps) {
  const [value, setValue] = useState("")

  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        setValue(e.target.value)
        onSearch(e.target.value)
      }}
      className="max-w-sm"
    />
  )
}
```

### apps/web/src/components/loading-card.tsx

```tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  )
}
```

### apps/web/src/components/empty-state.tsx

```tsx
import { Card, CardContent } from "@/components/ui/card"

export function EmptyState({ message = "Not configured" }: { message?: string }) {
  return (
    <Card>
      <CardContent className="py-8 text-center text-muted-foreground">
        {message}
      </CardContent>
    </Card>
  )
}
```

---

## Dynamic Route Strategy

Using single dynamic route `[category]/page.tsx` for all 21 categories.

### apps/web/src/app/[category]/page.tsx

```tsx
"use client"

import { useParams } from "next/navigation"
import { useMemo } from "react"
import { useConfig } from "@/hooks/use-config"
import { LoadingCard } from "@/components/loading-card"
import { EmptyState } from "@/components/empty-state"
import { CategoryRenderer } from "@/components/category-renderer"
import type { ConfigCategory } from "@cc/types"

const VALID_CATEGORIES: ConfigCategory[] = [
  'settings', 'memory', 'skills', 'agents', 'commands', 'plugins',
  'hooks', 'mcp', 'output-styles', 'models', 'permissions', 'tools',
  'environment', 'ide', 'sessions', 'enterprise', 'todos', 'metadata',
  'projects', 'status-line', 'authentication'
]

const CATEGORY_LABELS: Record<ConfigCategory, string> = {
  'settings': 'Settings',
  'memory': 'Memory Files',
  'skills': 'Skills',
  'agents': 'Agents',
  'commands': 'Slash Commands',
  'plugins': 'Plugins',
  'hooks': 'Hooks',
  'mcp': 'MCP Servers',
  'output-styles': 'Output Styles',
  'models': 'Models',
  'permissions': 'Permissions',
  'tools': 'Tools',
  'environment': 'Environment',
  'ide': 'IDE Integrations',
  'sessions': 'Sessions',
  'enterprise': 'Enterprise',
  'todos': 'Todos',
  'metadata': 'Metadata',
  'projects': 'Projects',
  'status-line': 'Status Line',
  'authentication': 'Authentication',
}

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as ConfigCategory

  const isValid = VALID_CATEGORIES.includes(category)
  const { data, loading, error } = useConfig(`/config/${category}`, category)

  if (!isValid) return <EmptyState message="Invalid category" />
  if (loading) return <LoadingCard />
  if (error) return <EmptyState message={error} />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{CATEGORY_LABELS[category]}</h1>
      <CategoryRenderer category={category} data={data} />
    </div>
  )
}
```

### apps/web/src/components/category-renderer.tsx

```tsx
"use client"

import type { ConfigCategory } from "@cc/types"
import { JsonViewer } from "./json-viewer"
import { SkillsView } from "./views/skills-view"
import { AgentsView } from "./views/agents-view"
import { CommandsView } from "./views/commands-view"
import { HooksView } from "./views/hooks-view"
import { McpView } from "./views/mcp-view"
import { PluginsView } from "./views/plugins-view"
import { PermissionsView } from "./views/permissions-view"
import { EmptyState } from "./empty-state"

interface CategoryRendererProps {
  category: ConfigCategory
  data: unknown
}

export function CategoryRenderer({ category, data }: CategoryRendererProps) {
  if (!data) return <EmptyState message="Not configured" />

  // Specialized renderers for complex categories
  switch (category) {
    case 'skills':
      return <SkillsView data={data} />
    case 'agents':
      return <AgentsView data={data} />
    case 'commands':
      return <CommandsView data={data} />
    case 'hooks':
      return <HooksView data={data} />
    case 'mcp':
      return <McpView data={data} />
    case 'plugins':
      return <PluginsView data={data} />
    case 'permissions':
      return <PermissionsView data={data} />
    // Default: JSON viewer for simpler categories
    default:
      return <JsonViewer data={data} />
  }
}
```

### Category View Components

Create specialized view components in `apps/web/src/components/views/`:

| File | Category | Display |
|------|----------|---------|
| `skills-view.tsx` | skills | Cards with name, description, tools |
| `agents-view.tsx` | agents | Cards with model, permission mode |
| `commands-view.tsx` | commands | Table with name, source |
| `hooks-view.tsx` | hooks | Grouped by event type |
| `mcp-view.tsx` | mcp | Cards with type, url/command |
| `plugins-view.tsx` | plugins | Cards with enabled badge |
| `permissions-view.tsx` | permissions | Tables: allow, ask, deny |

---

## Example: Skills Page

### apps/web/src/app/skills/page.tsx

```tsx
"use client"

import { useState, useMemo } from "react"
import { useConfig } from "@/hooks/use-config"
import type { Skill } from "@cc/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/search-input"
import { LoadingCard } from "@/components/loading-card"
import { EmptyState } from "@/components/empty-state"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export default function SkillsPage() {
  const { data: skills, loading, error } = useConfig<Skill[]>("/config/skills")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!skills) return []
    if (!search) return skills
    const q = search.toLowerCase()
    return skills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    )
  }, [skills, search])

  if (loading) return <LoadingCard />
  if (error) return <EmptyState message={error} />
  if (!skills?.length) return <EmptyState message="No skills found" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Skills ({skills.length})</h1>
        <SearchInput placeholder="Search skills..." onSearch={setSearch} />
      </div>

      <div className="grid gap-4">
        {filtered.map((skill) => (
          <Collapsible key={skill.path}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{skill.name}</CardTitle>
                    <Badge variant="outline">{skill.source}</Badge>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-2">
                  {skill.description && (
                    <p className="text-sm text-muted-foreground">
                      {skill.description}
                    </p>
                  )}
                  {skill.allowedTools && (
                    <div className="flex flex-wrap gap-1">
                      {skill.allowedTools.map((tool) => (
                        <Badge key={tool} variant="secondary">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground font-mono">
                    {skill.path}
                  </p>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}
```

---

## Credential Masking

### apps/web/src/lib/mask-secrets.ts

```typescript
const SECRET_PATTERNS = [
  /api[_-]?key/i,
  /secret/i,
  /password/i,
  /token/i,
  /credential/i,
  /auth/i,
]

export function maskSecrets(obj: unknown): unknown {
  if (typeof obj === "string") return obj
  if (Array.isArray(obj)) return obj.map(maskSecrets)
  if (typeof obj !== "object" || obj === null) return obj

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (SECRET_PATTERNS.some((p) => p.test(key))) {
      result[key] = "[REDACTED]"
    } else {
      result[key] = maskSecrets(value)
    }
  }
  return result
}
```

---

## Implementation Order

1. Create shared components (JsonViewer, SearchInput, etc.)
2. Implement high-priority pages: Settings, Skills, Agents, Commands
3. Implement MCP, Hooks, Plugins
4. Implement remaining categories
5. Add search filtering to all list pages
6. Apply credential masking

---

## Files to Create

| File | Purpose |
|------|---------|
| `components/json-viewer.tsx` | JSON syntax highlighting |
| `components/search-input.tsx` | Reusable search |
| `components/loading-card.tsx` | Loading skeleton |
| `components/empty-state.tsx` | Empty state message |
| `components/category-renderer.tsx` | Dynamic category switch |
| `components/views/skills-view.tsx` | Skills display |
| `components/views/agents-view.tsx` | Agents display |
| `components/views/commands-view.tsx` | Commands display |
| `components/views/hooks-view.tsx` | Hooks display |
| `components/views/mcp-view.tsx` | MCP display |
| `components/views/plugins-view.tsx` | Plugins display |
| `components/views/permissions-view.tsx` | Permissions display |
| `lib/mask-secrets.ts` | Credential masking |
| `app/[category]/page.tsx` | Dynamic route for all 21 categories |

---

## Success Criteria

- [ ] All 21 category pages render
- [ ] Search filters work on list pages
- [ ] JSON viewer syntax highlights
- [ ] Credentials masked with [REDACTED]
- [ ] Collapsible sections work
- [ ] Empty states show for missing configs
