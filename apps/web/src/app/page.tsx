import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Settings,
  Bot,
  Terminal,
  Plug,
  Webhook,
  Server,
  FileCode,
} from 'lucide-react'
import Link from 'next/link'

const categories = [
  { name: 'Settings', icon: Settings, href: '/settings', description: 'Global Claude Code settings' },
  { name: 'Skills', icon: FileCode, href: '/skills', description: 'Custom skills and prompts' },
  { name: 'Agents', icon: Bot, href: '/agents', description: 'Custom agent configurations' },
  { name: 'Commands', icon: Terminal, href: '/commands', description: 'Slash commands' },
  { name: 'Plugins', icon: Plug, href: '/plugins', description: 'Installed plugins' },
  { name: 'Hooks', icon: Webhook, href: '/hooks', description: 'Event hooks' },
  { name: 'MCP Servers', icon: Server, href: '/mcp', description: 'MCP server connections' },
]

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Claude Code Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          View and explore your Claude Code configurations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link key={cat.name} href={cat.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center gap-4">
                <cat.icon className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>{cat.name}</CardTitle>
                  <CardDescription>{cat.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
