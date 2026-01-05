import { useState, useEffect } from 'react'
import { getMemorySink, type LogEntry } from '../lib/log-manager.js'

export function useLogs(count: number = 10): LogEntry[] {
  const memorySink = getMemorySink()
  const [logs, setLogs] = useState<LogEntry[]>(() => memorySink.getRecent(count))

  useEffect(() => {
    const unsubscribe = memorySink.subscribe((entries) => {
      setLogs(entries.slice(-count))
    })
    return unsubscribe
  }, [count, memorySink])

  return logs
}
