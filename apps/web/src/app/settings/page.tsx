'use client'

import { useConfig } from '@/hooks/use-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function SettingsPage() {
  const { data, loading, error } = useConfig()

  if (loading) return <div className="text-muted-foreground">Loading...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>
  if (!data?.settings) return <div className="text-muted-foreground">No settings found</div>

  const settings = data.settings

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Global Claude Code settings</p>
      </div>

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

        {settings.permissions && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {settings.permissions.defaultMode && (
                <div>
                  <span className="text-sm text-muted-foreground">Default Mode: </span>
                  <Badge variant="outline">{settings.permissions.defaultMode}</Badge>
                </div>
              )}
              {settings.permissions.allow?.length ? (
                <div>
                  <span className="text-sm text-muted-foreground">Allow: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {settings.permissions.allow.map((p) => (
                      <Badge key={p} variant="success">{p}</Badge>
                    ))}
                  </div>
                </div>
              ) : null}
              {settings.permissions.deny?.length ? (
                <div>
                  <span className="text-sm text-muted-foreground">Deny: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {settings.permissions.deny.map((p) => (
                      <Badge key={p} variant="warning">{p}</Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}

        {settings.env && Object.keys(settings.env).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Environment Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(settings.env).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="font-mono text-xs">[REDACTED]</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
