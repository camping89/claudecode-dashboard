import type { ApiResponse, DashboardState } from '@cc/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4173'

export async function fetchConfig(): Promise<DashboardState> {
  const res = await fetch(`${API_BASE}/api/config/all`)
  const json: ApiResponse<DashboardState> = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data!
}

export function createWebSocket(onMessage: (data: unknown) => void): WebSocket {
  const ws = new WebSocket(`ws://localhost:4173/ws`)
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    onMessage(data)
  }
  return ws
}
