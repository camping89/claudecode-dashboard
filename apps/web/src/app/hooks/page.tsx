'use client'

import { useConfig } from '@/hooks/use-config'
import { ConfigList, ConfigItem } from '@/components/config-list'
import { Webhook } from 'lucide-react'

export default function HooksPage() {
  const { data, loading, error } = useConfig()

  if (loading) return <div className="text-muted-foreground">Loading...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!data) return null

  return (
    <ConfigList
      title="Hooks"
      description="Event hooks"
      count={data.hooks.length}
      emptyIcon={<Webhook className="h-10 w-10" />}
      emptyTitle="No Hooks Configured"
      emptyDescription="Hooks let you run custom commands on Claude Code events like SessionStart, PreToolUse, and more."
    >
      {data.hooks.map((hook, i) => (
        <ConfigItem
          key={hook.event + '-' + i}
          title={hook.event}
          description={hook.matcher ? 'Matcher: ' + hook.matcher : undefined}
          badges={[
            { label: hook.type, variant: 'secondary' },
            { label: hook.source, variant: 'outline' },
          ]}
          metadata={[
            ...(hook.command ? [{ label: 'Command', value: hook.command }] : []),
            ...(hook.prompt ? [{ label: 'Prompt', value: hook.prompt }] : []),
            ...(hook.timeout ? [{ label: 'Timeout', value: hook.timeout + 'ms' }] : []),
          ]}
        />
      ))}
    </ConfigList>
  )
}
