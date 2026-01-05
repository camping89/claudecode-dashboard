import React from 'react'
import { Box, Text } from 'ink'
import { useLogs } from '../hooks/use-logs.js'
import type { LogLevel } from '../lib/log-manager.js'

interface LogPanelProps {
  height?: number
}

function getLevelColor(level: LogLevel): string {
  switch (level) {
    case 'error': return 'red'
    case 'warn': return 'yellow'
    case 'info': return 'cyan'
    case 'debug': return 'gray'
  }
}

function getLevelIcon(level: LogLevel): string {
  switch (level) {
    case 'error': return '✗'
    case 'warn': return '⚠'
    case 'info': return '•'
    case 'debug': return '○'
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function LogPanel({ height = 5 }: LogPanelProps) {
  const logs = useLogs(height - 1)

  return (
    <Box flexDirection="column" height={height} borderStyle="single" borderColor="gray" paddingX={1}>
      <Text bold dimColor>LOG</Text>
      {logs.length === 0 ? (
        <Text dimColor italic>No logs yet</Text>
      ) : (
        logs.map((log, i) => (
          <Text key={i} wrap="truncate">
            <Text dimColor>{formatTime(log.timestamp)}</Text>
            {' '}
            <Text color={getLevelColor(log.level)}>{getLevelIcon(log.level)}</Text>
            {' '}
            <Text dimColor>[{log.source}]</Text>
            {' '}
            <Text color={log.level === 'error' ? 'red' : undefined}>{log.message}</Text>
          </Text>
        ))
      )}
    </Box>
  )
}
