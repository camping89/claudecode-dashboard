'use client'

import { useConfig } from '@/hooks/use-config'
import { ConfigList, ConfigItem } from '@/components/config-list'
import { Plug } from 'lucide-react'

export default function PluginsPage() {
  const { data, loading, error } = useConfig()

  if (loading) return <div className="text-muted-foreground">Loading...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!data) return null

  return (
    <ConfigList
      title="Plugins"
      description="Installed plugins"
      count={data.plugins.length}
      emptyIcon={<Plug className="h-10 w-10" />}
      emptyTitle="No Plugins Installed"
      emptyDescription="Plugins extend Claude Code with additional commands, skills, and agents. Install plugins to enhance your workflow."
    >
      {data.plugins.map((plugin) => (
        <ConfigItem
          key={plugin.path}
          title={plugin.name}
          description={plugin.description}
          badges={[
            { label: plugin.enabled ? 'enabled' : 'disabled', variant: plugin.enabled ? 'success' : 'secondary' },
            ...(plugin.version ? [{ label: 'v' + plugin.version, variant: 'outline' as const }] : []),
          ]}
          metadata={[
            { label: 'Path', value: plugin.path },
            ...(plugin.commands?.length ? [{ label: 'Commands', value: String(plugin.commands.length) }] : []),
            ...(plugin.skills?.length ? [{ label: 'Skills', value: String(plugin.skills.length) }] : []),
            ...(plugin.agents?.length ? [{ label: 'Agents', value: String(plugin.agents.length) }] : []),
          ]}
        />
      ))}
    </ConfigList>
  )
}
