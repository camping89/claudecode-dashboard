import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createBunWebSocket } from 'hono/bun'
import type { ServerWebSocket } from 'bun'
import type { ApiResponse, ConfigCategory, WsMessage } from '@cc/types'
import { configRouter } from './routes/config'
import { startWatcher } from './watcher'

const PORT = 4173
const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>()

const app = new Hono()

// CORS for frontend
app.use('*', cors({ origin: 'http://localhost:3000' }))

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Config API routes
app.route('/api/config', configRouter)

// WebSocket for real-time updates
const wsClients = new Set<ServerWebSocket>()

app.get(
  '/ws',
  upgradeWebSocket(() => ({
    onOpen(_event, ws) {
      wsClients.add(ws.raw as ServerWebSocket)
    },
    onClose(_event, ws) {
      wsClients.delete(ws.raw as ServerWebSocket)
    },
    onMessage(event, ws) {
      const data = JSON.parse(String(event.data)) as WsMessage
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    },
  }))
)

// Broadcast config updates to all connected clients
export function broadcast(category: ConfigCategory, data: unknown) {
  const message: WsMessage = { type: 'config-update', category, data }
  const payload = JSON.stringify(message)
  for (const client of wsClients) {
    client.send(payload)
  }
}

// Start file watcher
startWatcher(broadcast)

console.log(`🚀 CC Dashboard API running on http://localhost:${PORT}`)

export default {
  port: PORT,
  fetch: app.fetch,
  websocket,
}
