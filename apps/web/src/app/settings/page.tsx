'use client'

import { useConfig } from '@/hooks/use-config'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Check, X } from 'lucide-react'

interface SettingsData {
  model?: string
  outputStyle?: string
  includeCoAuthoredBy?: boolean
  statusLine?: Record<string, unknown>
  enabledPlugins?: Record<string, boolean>
  permissions?: Record<string, unknown>
  hooks?: Record<string, unknown>
  env?: Record<string, string>
}

export default function SettingsPage() {
  const { data, loading, error } = useConfig()

  if (loading) return <div className="text-muted-foreground">Loading...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!data?.settings) return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Global Claude Code settings</p>
      </div>
      <EmptyState />
    </div>
  )

  const settings = data.settings as SettingsData
  const hasContent = Object.keys(settings).length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Global Claude Code settings</p>
      </div>

      {!hasContent ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {settings.model && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Model</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">{settings.model}</Badge>
              </CardContent>
            </Card>
          )}

          {settings.outputStyle && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Output Style</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">{settings.outputStyle}</Badge>
              </CardContent>
            </Card>
          )}

          {settings.includeCoAuthoredBy !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Include Co-Authored By</CardTitle>
                <CardDescription>Add co-author attribution in commits</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant={settings.includeCoAuthoredBy ? 'success' : 'secondary'}>
                  {settings.includeCoAuthoredBy ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                  {settings.includeCoAuthoredBy ? 'Enabled' : 'Disabled'}
                </Badge>
              </CardContent>
            </Card>
          )}

          {settings.statusLine && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status Line</CardTitle>
                <CardDescription>Custom status line configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(settings.statusLine, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {settings.enabledPlugins && Object.keys(settings.enabledPlugins).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Enabled Plugins</CardTitle>
                <CardDescription>
                  {Object.values(settings.enabledPlugins).filter(Boolean).length} plugins enabled
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(settings.enabledPlugins).map(([name, enabled]) => (
                    <Badge key={name} variant={enabled ? 'success' : 'secondary'}>
                      {name.replace('@claude-plugins-official', '')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {settings.permissions && Object.keys(settings.permissions).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Permissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(settings.permissions, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {settings.hooks && Object.keys(settings.hooks).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hooks</CardTitle>
                <CardDescription>Event hooks configured</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(settings.hooks).map((hookType) => (
                    <Badge key={hookType} variant="outline">
                      {hookType}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <Settings className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg">No Settings Configured</h3>
        <p className="text-muted-foreground text-sm mt-1 max-w-sm">
          Settings are stored in ~/.claude/settings.json. Configure your Claude Code preferences there.
        </p>
      </CardContent>
    </Card>
  )
}
