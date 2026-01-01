'use client'

import { useConfig } from '@/hooks/use-config'
import { ConfigList, ConfigItem } from '@/components/config-list'

export default function AgentsPage() {
  const { data, loading, error } = useConfig()

  if (loading) return <div className="text-muted-foreground">Loading...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!data) return null

  return (
    <ConfigList title="Agents" description="Custom agent configurations" count={data.agents.length}>
      {data.agents.map((agent) => (
        <ConfigItem
          key={agent.path}
          title={agent.name}
          description={agent.description}
          badges={[
            { label: agent.source, variant: 'secondary' },
            ...(agent.model ? [{ label: agent.model, variant: 'outline' as const }] : []),
            ...(agent.permissionMode ? [{ label: agent.permissionMode, variant: 'warning' as const }] : []),
          ]}
          metadata={[
            { label: 'Path', value: agent.path },
            ...(agent.tools?.length ? [{ label: 'Tools', value: agent.tools.join(', ') }] : []),
            ...(agent.skills?.length ? [{ label: 'Skills', value: agent.skills.join(', ') }] : []),
          ]}
        />
      ))}
    </ConfigList>
  )
}
