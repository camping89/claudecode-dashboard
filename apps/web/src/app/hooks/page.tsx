'use client'

import { useConfig } from '@/hooks/use-config'
import { ConfigList, ConfigItem } from '@/components/config-list'

export default function HooksPage() {
  const { data, loading, error } = useConfig()

  if (loading) return <div className="text-muted-foreground">Loading...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!data) return null

  return (
    <ConfigList title="Hooks" description="Event hooks" count={data.hooks.length}>
      {data.hooks.map((hook, i) => (
        <ConfigItem
          key={`${hook.event}-${i}`}
          title={hook.event}
          description={hook.matcher ? `Matcher: ${hook.matcher}` : undefined}
          badges={[
            { label: hook.type, variant: 'secondary' },
            { label: hook.source, variant: 'outline' },
          ]}
          metadata={[
            ...(hook.command ? [{ label: 'Command', value: hook.command }] : []),
            ...(hook.prompt ? [{ label: 'Prompt', value: hook.prompt }] : []),
            ...(hook.timeout ? [{ label: 'Timeout', value: `${hook.timeout}ms` }] : []),
          ]}
        />
      ))}
    </ConfigList>
  )
}
