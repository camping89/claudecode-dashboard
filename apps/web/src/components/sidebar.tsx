'use client'

import { useState } from 'react'
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
  Menu,
  X,
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
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-card border md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative z-40 h-full w-64 border-r bg-card p-4 transition-transform duration-200',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="mb-8 mt-12 md:mt-0">
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
                onClick={() => setIsOpen(false)}
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
    </>
  )
}
