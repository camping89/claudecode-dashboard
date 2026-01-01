'use client'

import { useConfig } from '@/hooks/use-config'
import { ConfigList, ConfigItem } from '@/components/config-list'
import { Server } from 'lucide-react'

export default function McpPage() {
  const { data, loading, error } = useConfig()

  if (loading) return <div className="text-muted-foreground">Loading...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!data) return null

  return (
    <ConfigList
      title="MCP Servers"
      description="Model Context Protocol server connections"
      count={data.mcpServers.length}
      emptyIcon={<Server className="h-10 w-10" />}
      emptyTitle="No MCP Servers Configured"
      emptyDescription="MCP servers provide tools and resources to Claude. Configure servers in your settings to extend capabilities."
    >
      {data.mcpServers.map((server) => (
        <ConfigItem
          key={server.name}
          title={server.name}
          badges={[
            { label: server.type, variant: 'secondary' },
            { label: server.scope, variant: 'outline' },
          ]}
          metadata={[
            ...(server.url ? [{ label: 'URL', value: server.url }] : []),
            ...(server.command ? [{ label: 'Command', value: server.command }] : []),
            ...(server.args?.length ? [{ label: 'Args', value: server.args.join(' ') }] : []),
          ]}
        />
      ))}
    </ConfigList>
  )
}
