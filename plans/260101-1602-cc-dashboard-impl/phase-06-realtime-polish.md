---
phase: 06
title: "Real-time & Polish"
status: pending
effort: 1h
dependencies: [phase-05]
---

# Phase 06: Real-time Updates & Polish

## Context

- Parent: [plan.md](./plan.md)
- Depends on: [Phase 05](./phase-05-config-sections.md)

---

## Overview

Add WebSocket integration for real-time updates, global search, and final polish.

---

## Implementation Steps

### 1. WebSocket Hook

#### apps/web/src/hooks/use-websocket.ts

```typescript
"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { WsMessage } from "@cc/types"

const WS_URL = "ws://localhost:4173/ws"
const RECONNECT_DELAY = 3000
const MAX_RECONNECT_ATTEMPTS = 5

interface UseWebSocketOptions {
  onMessage?: (message: WsMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WsMessage | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const ws = new WebSocket(WS_URL)

      ws.onopen = () => {
        setIsConnected(true)
        reconnectAttempts.current = 0
        options.onConnect?.()
        console.log("WebSocket connected")
      }

      ws.onmessage = (event) => {
        try {
          const message: WsMessage = JSON.parse(event.data)
          setLastMessage(message)
          options.onMessage?.(message)
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        options.onDisconnect?.()
        console.log("WebSocket disconnected")

        // Auto-reconnect with exponential backoff
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current)
          reconnectTimeout.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
      }

      wsRef.current = ws
    } catch (e) {
      console.error("Failed to create WebSocket:", e)
    }
  }, [options])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      wsRef.current?.close()
    }
  }, [connect])

  return { isConnected, lastMessage }
}
```

### 2. Config Context with Real-time Updates

#### apps/web/src/context/config-context.tsx

```tsx
"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { useWebSocket } from "@/hooks/use-websocket"
import type { WsMessage, ConfigCategory } from "@cc/types"

interface ConfigContextValue {
  isConnected: boolean
  lastUpdate: { category: ConfigCategory; timestamp: Date } | null
  refetch: (category?: ConfigCategory) => void
}

const ConfigContext = createContext<ConfigContextValue | null>(null)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [lastUpdate, setLastUpdate] = useState<ConfigContextValue["lastUpdate"]>(null)

  const handleMessage = useCallback((message: WsMessage) => {
    if (message.type === "config-update" && message.category) {
      setLastUpdate({
        category: message.category,
        timestamp: new Date(),
      })

      // Trigger refetch for affected category
      window.dispatchEvent(
        new CustomEvent("config-update", { detail: message.category })
      )
    }
  }, [])

  const { isConnected } = useWebSocket({ onMessage: handleMessage })

  const refetch = useCallback((category?: ConfigCategory) => {
    window.dispatchEvent(
      new CustomEvent("config-refetch", { detail: category })
    )
  }, [])

  return (
    <ConfigContext.Provider value={{ isConnected, lastUpdate, refetch }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfigContext() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error("useConfigContext must be used within ConfigProvider")
  return ctx
}
```

### 3. Update useConfig Hook for Real-time

#### apps/web/src/hooks/use-config.ts (updated)

```typescript
"use client"

import { useState, useEffect, useCallback } from "react"
import type { ApiResponse, ConfigCategory } from "@cc/types"

const API_BASE = "http://localhost:4173/api"

export function useConfig<T>(endpoint: string, category?: ConfigCategory) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}${endpoint}`)
      const json: ApiResponse<T> = await res.json()
      if (json.success) {
        setData(json.data ?? null)
        setError(null)
      } else {
        setError(json.error ?? "Unknown error")
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fetch failed")
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Listen for real-time updates
  useEffect(() => {
    const handleUpdate = (e: CustomEvent<ConfigCategory>) => {
      if (!category || e.detail === category) {
        fetchData()
      }
    }

    const handleRefetch = (e: CustomEvent<ConfigCategory | undefined>) => {
      if (!e.detail || e.detail === category) {
        fetchData()
      }
    }

    window.addEventListener("config-update", handleUpdate as EventListener)
    window.addEventListener("config-refetch", handleRefetch as EventListener)

    return () => {
      window.removeEventListener("config-update", handleUpdate as EventListener)
      window.removeEventListener("config-refetch", handleRefetch as EventListener)
    }
  }, [fetchData, category])

  return { data, loading, error, refetch: fetchData }
}
```

### 4. Connection Status Indicator

#### apps/web/src/components/connection-status.tsx

```tsx
"use client"

import { useConfigContext } from "@/context/config-context"
import { Badge } from "@/components/ui/badge"

export function ConnectionStatus() {
  const { isConnected, lastUpdate } = useConfigContext()

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isConnected ? "default" : "destructive"}>
        {isConnected ? "Connected" : "Disconnected"}
      </Badge>
      {lastUpdate && (
        <span className="text-xs text-muted-foreground">
          Last update: {lastUpdate.category} ({lastUpdate.timestamp.toLocaleTimeString()})
        </span>
      )}
    </div>
  )
}
```

### 5. Global Search

#### apps/web/src/components/global-search.tsx

```tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface SearchResult {
  category: string
  name: string
  path: string
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const router = useRouter()

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Search API call (debounced)
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:4173/api/search?q=${encodeURIComponent(query)}`
        )
        const json = await res.json()
        if (json.success) {
          setResults(json.data)
        }
      } catch {
        // Ignore search errors
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md text-muted-foreground hover:bg-muted">
          <span>Search...</span>
          <kbd className="px-1.5 py-0.5 text-xs border rounded bg-muted">⌘K</kbd>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search configs..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Results">
              {results.map((result) => (
                <CommandItem
                  key={result.path}
                  onSelect={() => {
                    router.push(result.path)
                    setOpen(false)
                  }}
                >
                  <span className="font-medium">{result.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {result.category}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

### 6. Update Layout with Providers

#### apps/web/src/app/layout.tsx (final)

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ConfigProvider } from "@/context/config-context"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { ConnectionStatus } from "@/components/connection-status"
import { GlobalSearch } from "@/components/global-search"

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
          <ConfigProvider>
            <SidebarProvider>
              <AppSidebar />
              <main className="flex-1">
                <header className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger />
                    <GlobalSearch />
                  </div>
                  <div className="flex items-center gap-4">
                    <ConnectionStatus />
                    <ThemeToggle />
                  </div>
                </header>
                <div className="p-6">{children}</div>
              </main>
            </SidebarProvider>
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 7. Add Search API Endpoint (Backend)

#### apps/api/src/routes/search-routes.ts

```typescript
import { Hono } from "hono"
import {
  readSkills,
  readAgents,
  readCommands,
  readPlugins,
  readMcpServers,
} from "@cc/config-reader"

const searchRoutes = new Hono()

searchRoutes.get("/", async (c) => {
  const query = c.req.query("q")?.toLowerCase()
  if (!query || query.length < 2) {
    return c.json({ success: true, data: [] })
  }

  const [skills, agents, commands, plugins, mcp] = await Promise.all([
    readSkills(),
    readAgents(),
    readCommands(),
    readPlugins(),
    readMcpServers(),
  ])

  const results: Array<{ category: string; name: string; path: string }> = []

  // Search skills
  skills?.forEach((s) => {
    if (s.name.toLowerCase().includes(query)) {
      results.push({ category: "Skills", name: s.name, path: "/skills" })
    }
  })

  // Search agents
  agents?.forEach((a) => {
    if (a.name.toLowerCase().includes(query)) {
      results.push({ category: "Agents", name: a.name, path: "/agents" })
    }
  })

  // Search commands
  commands?.forEach((cmd) => {
    if (cmd.name.toLowerCase().includes(query)) {
      results.push({ category: "Commands", name: cmd.name, path: "/commands" })
    }
  })

  // Search plugins
  plugins?.forEach((p) => {
    if (p.name.toLowerCase().includes(query)) {
      results.push({ category: "Plugins", name: p.name, path: "/plugins" })
    }
  })

  // Search MCP servers
  mcp?.forEach((m) => {
    if (m.name.toLowerCase().includes(query)) {
      results.push({ category: "MCP", name: m.name, path: "/mcp" })
    }
  })

  return c.json({ success: true, data: results.slice(0, 10) })
})

export { searchRoutes }
```

---

## Files to Create/Update

| File | Purpose |
|------|---------|
| `hooks/use-websocket.ts` | WebSocket connection |
| `context/config-context.tsx` | Real-time state |
| `hooks/use-config.ts` | Update with real-time |
| `components/connection-status.tsx` | Connection indicator |
| `components/global-search.tsx` | Cmd+K search |
| `app/layout.tsx` | Add providers |
| `api/routes/search-routes.ts` | Search endpoint |

---

## Add shadcn Components

```bash
bunx shadcn@latest add command popover
```

---

## Verification

```bash
# Terminal 1: Start API
cd apps/api && bun run dev

# Terminal 2: Start Web
cd apps/web && bun run dev

# Test:
# 1. Open http://localhost:3000
# 2. Check connection status shows "Connected"
# 3. Press Cmd+K, search for a skill/agent
# 4. Modify ~/.claude/settings.json
# 5. Dashboard should auto-refresh
```

---

## Success Criteria

- [ ] WebSocket connects on page load
- [ ] Connection status shows in header
- [ ] File changes trigger auto-refresh
- [ ] Cmd+K opens global search
- [ ] Search returns relevant results
- [ ] Reconnects on disconnect
