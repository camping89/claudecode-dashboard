# Research: Next.js 16 App Router + shadcn/ui + Tailwind CSS

**Date:** 2026-01-01 | **Status:** Complete

---

## Executive Summary

Next.js 16 introduces opt-in caching (default dynamic), Turbopack (5-10x faster builds), React Compiler (auto-memoization), and proxy.ts (replaces middleware). Combined with shadcn/ui's composable components and Tailwind CSS, modern dashboards achieve fast development cycles with zero flashing on dark mode.

---

## 1. Next.js 16 App Router Architecture

### Key Features
- **Opt-in Caching**: All dynamic by default (vs implicit caching pre-16)
- **Turbopack**: Default bundler, 5-10x faster Fast Refresh, 2-5x faster builds
- **Partial Prerendering (PPR)**: Mix static + dynamic Suspense zones per route
- **React Compiler**: Built-in auto-memoization (stable since React 1.0)
- **Proxy**: `proxy.ts` replaces middleware for clearer network boundaries
- **React 19.2**: View Transitions, useEffectEvent, Activity components

### Recommended Project Structure
```
src/
├── app/                    # App Router (root layout + pages)
├── components/
│   ├── ui/                # shadcn components (Card, Button, etc)
│   └── features/          # Feature-specific components
├── lib/                   # Utilities (NOT a 2000-line file)
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
├── styles/                # Global CSS (Tailwind imports)
└── context/               # React Context providers (auth, themes)
```

---

## 2. shadcn/ui + Bun Setup

### Installation with Bun
```bash
bun create vite my-project -- --template react-ts
cd my-project
bun install

# Initialize shadcn
bunx shadcn@latest init

# Add specific components
bunx shadcn@latest add card button sidebar table
```

### Bun Workspace Config (Monorepo)
```json
{
  "packageManager": "bun@1.2.0",
  "workspaces": ["apps/*", "packages/*"]
}
```

### Troubleshooting
- If `bunx shadcn@latest init` fails → try `bunx shadcn@canary init` (Tailwind v4 fixes)
- Remove pnpm files (`pnpm-lock.json`, `pnpm-workspace.yaml`) when switching to Bun
- Bun's package manager detection relies on @antfu/ni (automatic fallback)

---

## 3. Dashboard Components (shadcn/ui)

### Core Components
| Component | Purpose | Notes |
|-----------|---------|-------|
| **Sidebar** | App navigation, collapsible | SidebarProvider, SidebarHeader/Footer (sticky) |
| **Table** | Data display with sorting/pagination | Built on TanStack Table v8 |
| **Card** | Content containers (Header, Title, Content, Footer) | 15+ variants available |
| **Tabs** | Tabbed interfaces | Controlled/uncontrolled patterns |
| **ScrollArea** | Scrollable containers | Handles overflow gracefully |
| **Collapsible** | Expandable sections | Accordion-like patterns |
| **Button** | Actions | Multiple variants (solid, ghost, outline) |

### Dashboard Example Structure
```tsx
// components/app-sidebar.tsx
export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>Brand</SidebarHeader>
      <SidebarContent>{/* nav links */}</SidebarContent>
      <SidebarFooter>User menu</SidebarFooter>
    </Sidebar>
  )
}

// app/layout.tsx
<SidebarProvider>
  <AppSidebar />
  <main>{children}</main>
</SidebarProvider>
```

---

## 4. Dark/Light Theme with next-themes

### Installation & Setup
```bash
bun add next-themes
```

### ThemeProvider Component
```tsx
// components/theme-provider.tsx
"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

### Root Layout Integration
```tsx
// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Tailwind Config
```ts
// tailwind.config.ts
export default {
  darkMode: 'class',
  theme: { /* ... */ },
  plugins: [],
}
```

### Theme Toggle Component
```tsx
// components/theme-toggle.tsx
"use client"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  )
}
```

**Key Point:** Must track `mounted` state to prevent hydration mismatch on server-side render.

---

## 5. JSON Syntax Highlighting

### Recommended: react-syntax-highlighter
```bash
bun add react-syntax-highlighter
bun add -d @types/react-syntax-highlighter
```

```tsx
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'

export function JsonViewer({ json }: { json: string }) {
  return (
    <SyntaxHighlighter language="json" style={atomOneDark}>
      {json}
    </SyntaxHighlighter>
  )
}
```

### Alternative: Lightweight (Prism)
```bash
bun add prismjs react-prism
```

---

## 6. Search/Filter UI Patterns

### Pattern 1: Controlled Input + useMemo Filter
```tsx
"use client"
import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"

export function DataTable({ data }) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(
    () => data.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    ),
    [data, query]
  )

  return (
    <>
      <Input
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Table>
        {filtered.map(item => <TableRow key={item.id} {...item} />)}
      </Table>
    </>
  )
}
```

### Pattern 2: Advanced Filters (Collapsible)
```tsx
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"

export function FilterPanel() {
  return (
    <Collapsible>
      <CollapsibleTrigger>Show Filters</CollapsibleTrigger>
      <CollapsibleContent>
        <Select>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </Select>
      </CollapsibleContent>
    </Collapsible>
  )
}
```

---

## Best Practices Summary

1. **File Organization**: Separate `ui/` (shadcn) from `features/` (app-specific)
2. **No Monolithic Utils**: Break lib utilities by domain (auth, api, format, etc)
3. **Use "use client" Sparingly**: Only on interactive leaf components
4. **Avoid Redundant Code**: Use layouts for shared UI (header, sidebar)
5. **Hydration Safety**: Always check `mounted` state for client hooks + localStorage
6. **Performance**: React Compiler auto-memoizes; lazy-load heavy routes with Suspense
7. **Theme Flashing**: `suppressHydrationWarning` + `disableTransitionOnChange` = no flicker
8. **Tailwind Dark Mode**: Always set `darkMode: 'class'` before using next-themes

---

## Sources

### Official Documentation
- [Next.js 16 Blog](https://nextjs.org/blog/next-16)
- [App Router Guides](https://nextjs.org/docs/app/guides)
- [App Router Getting Started](https://nextjs.org/docs/app/getting-started)
- [shadcn/ui Installation](https://ui.shadcn.com/docs/installation)
- [shadcn/ui Dark Mode (Next.js)](https://ui.shadcn.com/docs/dark-mode/next)
- [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/sidebar)
- [shadcn/ui Dashboard Example](https://ui.shadcn.com/examples/dashboard)

### Community Resources
- [Medium: Next.js 16 File Structure (2025)](https://medium.com/better-dev-nextjs-react/inside-the-app-router-best-practices-for-next-js-file-and-directory-structure-2025-edition-ed6bc14a8da3)
- [Medium: shadcn/ui + Bun Setup](https://medium.com/@naveenalla3000/how-to-install-all-components-of-shadcn-ui-in-one-command-bun-setup-9f2fe1e959bc)
- [GitHub: next-themes](https://github.com/pacocoursey/next-themes)
- [Dave Gray: Light/Dark Mode No Flicker](https://www.davegray.codes/posts/light-dark-mode-nextjs-app-router-tailwind)

### Package Managers & Tooling
- [Bun Create Documentation](https://bun.com/docs/runtime/templating/create)
- [GitHub Issue: Turborepo + Bun Workspaces](https://github.com/shadcn-ui/ui/discussions/6465)

---

## Unresolved Questions

- Optimal React Compiler configuration flags for Next.js 16 production builds
- PPR partial prerendering strategy when combining with ISR for large dashboards
- Best practices for combining proxy.ts with API route security (vs middleware)
