'use client'

import { useConfig } from '@/hooks/use-config'
import { ConfigList, ConfigItem } from '@/components/config-list'

export default function SkillsPage() {
  const { data, loading, error } = useConfig()

  if (loading) return <div className="text-muted-foreground">Loading...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!data) return null

  return (
    <ConfigList title="Skills" description="Custom skills and prompts" count={data.skills.length}>
      {data.skills.map((skill) => (
        <ConfigItem
          key={skill.path}
          title={skill.name}
          description={skill.description}
          badges={[
            { label: skill.source, variant: 'secondary' },
            ...(skill.model ? [{ label: skill.model, variant: 'outline' as const }] : []),
          ]}
          metadata={[
            { label: 'Path', value: skill.path },
            ...(skill.allowedTools?.length
              ? [{ label: 'Allowed Tools', value: skill.allowedTools.join(', ') }]
              : []),
          ]}
        />
      ))}
    </ConfigList>
  )
}
