'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Settings,
  Bot,
  Terminal,
  Plug,
  Webhook,
  Server,
  FileCode,
  Home,
} from 'lucide-react'

const navItems = [
  { name: 'Overview', icon: Home, href: '/' },
  { name: 'Settings', icon: Settings, href: '/settings' },
  { name: 'Skills', icon: FileCode, href: '/skills' },
  { name: 'Agents', icon: Bot, href: '/agents' },
  { name: 'Commands', icon: Terminal, href: '/commands' },
  { name: 'Plugins', icon: Plug, href: '/plugins' },
  { name: 'Hooks', icon: Webhook, href: '/hooks' },
  { name: 'MCP Servers', icon: Server, href: '/mcp' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-card p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">CC Dashboard</h2>
        <p className="text-sm text-muted-foreground">Claude Code Config Viewer</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
