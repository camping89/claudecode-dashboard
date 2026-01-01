'use client'

import { useState, useEffect } from 'react'
import type { DashboardState, WsMessage } from '@cc/types'
import { fetchConfig, createWebSocket } from '@/lib/api'

export function useConfig() {
  const [data, setData] = useState<DashboardState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchConfig()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))

    const ws = createWebSocket((msg: unknown) => {
      const wsMsg = msg as WsMessage
      if (wsMsg.type === 'config-update' && wsMsg.category && wsMsg.data) {
        setData((prev) => {
          if (!prev) return prev
          return { ...prev, [wsMsg.category!]: wsMsg.data }
        })
      }
    })

    return () => ws.close()
  }, [])

  return { data, loading, error }
}
