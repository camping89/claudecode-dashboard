---
phase: 04
title: "Frontend Shell"
status: pending
effort: 2h
dependencies: [phase-03]
---

# Phase 04: Frontend Shell (Next.js 16 + shadcn/ui)

## Context

- Parent: [plan.md](./plan.md)
- Depends on: [Phase 03](./phase-03-api-backend.md)
- Research: [Next.js 16 + shadcn](./research/researcher-02-nextjs-shadcn.md)

---

## Overview

Initialize Next.js 16 app with shadcn/ui, Tailwind, sidebar layout, and theme toggle.

---

## Implementation Steps

### 1. Create Next.js App

```bash
cd apps
bunx create-next-app@latest web --typescript --tailwind --eslint --app --turbopack --src-dir
cd web
```

### 2. apps/web/package.json (update)

```json
{
  "name": "@cc/web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack -p 3000",
    "build": "next build",
    "start": "next start",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@cc/types": "workspace:*",
    "next": "^16.1.0",
    "next-themes": "^0.4.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-syntax-highlighter": "^15.6.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-syntax-highlighter": "^15.5.0",
    "typescript": "^5.7.0",
    "tailwindcss": "^4.0.0"
  }
}
```

### 3. apps/web/next.config.ts

```typescript
import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: ['@cc/types'],
}

export default nextConfig
```

### 4. Initialize shadcn/ui

```bash
bunx shadcn@latest init

# Select:
# - Style: Default
# - Base color: Zinc
# - CSS variables: Yes
```

### 5. Add Required Components

```bash
bunx shadcn@latest add sidebar card button tabs scroll-area collapsible input badge separator
```

### 6. apps/web/src/components/theme-provider.tsx

```tsx
"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
```

### 7. apps/web/src/components/theme-toggle.tsx

```tsx
"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </Button>
  )
}
```

### 8. apps/web/src/components/app-sidebar.tsx

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const categories = [
  { name: "Overview", href: "/" },
  { name: "Settings", href: "/settings" },
  { name: "Memory", href: "/memory" },
  { name: "Skills", href: "/skills" },
  { name: "Agents", href: "/agents" },
  { name: "Commands", href: "/commands" },
  { name: "Plugins", href: "/plugins" },
  { name: "Hooks", href: "/hooks" },
  { name: "MCP Servers", href: "/mcp" },
  { name: "Output Styles", href: "/output-styles" },
  { name: "Models", href: "/models" },
  { name: "Permissions", href: "/permissions" },
  { name: "Tools", href: "/tools" },
  { name: "Environment", href: "/environment" },
  { name: "IDE", href: "/ide" },
  { name: "Sessions", href: "/sessions" },
  { name: "Enterprise", href: "/enterprise" },
  { name: "Todos", href: "/todos" },
  { name: "Metadata", href: "/metadata" },
  { name: "Projects", href: "/projects" },
  { name: "Raw Files", href: "/raw" },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h1 className="text-lg font-bold">Claude Code Config</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((cat) => (
                <SidebarMenuItem key={cat.href}>
                  <SidebarMenuButton asChild isActive={pathname === cat.href}>
                    <Link href={cat.href}>{cat.name}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
```

### 9. apps/web/src/app/layout.tsx

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Claude Code Dashboard",
  description: "Configuration viewer for Claude Code",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1">
              <header className="flex items-center justify-between p-4 border-b">
                <SidebarTrigger />
                <ThemeToggle />
              </header>
              <div className="p-6">{children}</div>
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 10. apps/web/src/app/page.tsx

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Claude Code Configuration</h1>
      <p className="text-muted-foreground">
        Read-only dashboard for viewing all Claude Code configurations.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View settings.json configuration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Browse registered skills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View subagent configurations
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### 11. apps/web/src/hooks/use-config.ts

```typescript
"use client"

import { useState, useEffect } from "react"
import type { ApiResponse } from "@cc/types"

const API_BASE = "http://localhost:4173/api"

export function useConfig<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${API_BASE}${endpoint}`)
        const json: ApiResponse<T> = await res.json()
        if (json.success) {
          setData(json.data ?? null)
        } else {
          setError(json.error ?? "Unknown error")
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Fetch failed")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [endpoint])

  return { data, loading, error }
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `apps/web/package.json` | Package manifest |
| `apps/web/next.config.ts` | Next.js config |
| `apps/web/src/components/theme-provider.tsx` | Theme context |
| `apps/web/src/components/theme-toggle.tsx` | Dark/light toggle |
| `apps/web/src/components/app-sidebar.tsx` | Navigation sidebar |
| `apps/web/src/app/layout.tsx` | Root layout |
| `apps/web/src/app/page.tsx` | Home page |
| `apps/web/src/hooks/use-config.ts` | API fetch hook |

---

## Verification

```bash
cd apps/web
bun install
bun run dev

# Open http://localhost:3000
# - Sidebar visible
# - Theme toggle works
# - No hydration errors
```

---

## Success Criteria

- [ ] Next.js app runs on port 3000
- [ ] Sidebar renders all 21 categories
- [ ] Theme toggle switches dark/light
- [ ] No hydration mismatches
- [ ] shadcn components styled correctly
