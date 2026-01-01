'use client'

import { useConfig } from '@/hooks/use-config'
import { ConfigList, ConfigItem } from '@/components/config-list'

export default function CommandsPage() {
  const { data, loading, error } = useConfig()

  if (loading) return <div className="text-muted-foreground">Loading...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!data) return null

  return (
    <ConfigList title="Commands" description="Slash commands" count={data.commands.length}>
      {data.commands.map((cmd) => (
        <ConfigItem
          key={cmd.name}
          title={`/${cmd.name}`}
          description={cmd.description}
          badges={[
            { label: cmd.source, variant: 'secondary' },
            ...(cmd.model ? [{ label: cmd.model, variant: 'outline' as const }] : []),
          ]}
          metadata={[
            ...(cmd.path ? [{ label: 'Path', value: cmd.path }] : []),
            ...(cmd.argumentHint ? [{ label: 'Arguments', value: cmd.argumentHint }] : []),
            ...(cmd.allowedTools?.length
              ? [{ label: 'Allowed Tools', value: cmd.allowedTools.join(', ') }]
              : []),
          ]}
        />
      ))}
    </ConfigList>
  )
}
