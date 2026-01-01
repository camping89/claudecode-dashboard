'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ConfigItemProps {
  title: string
  description?: string
  badges?: { label: string; variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' }[]
  metadata?: { label: string; value: string }[]
  children?: React.ReactNode
}

export function ConfigItem({ title, description, badges, metadata, children }: ConfigItemProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          {badges && badges.length > 0 && (
            <div className="flex gap-1">
              {badges.map((b) => (
                <Badge key={b.label} variant={b.variant}>
                  {b.label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      {(metadata || children) && (
        <CardContent>
          {metadata && (
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {metadata.map((m) => (
                <div key={m.label}>
                  <dt className="text-muted-foreground">{m.label}</dt>
                  <dd className="font-mono text-xs">{m.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {children}
        </CardContent>
      )}
    </Card>
  )
}

interface ConfigListProps {
  title: string
  description?: string
  count?: number
  children: React.ReactNode
}

export function ConfigList({ title, description, count, children }: ConfigListProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {title}
          {count !== undefined && (
            <span className="ml-2 text-lg font-normal text-muted-foreground">({count})</span>
          )}
        </h1>
        {description && <p className="text-muted-foreground mt-2">{description}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  )
}
