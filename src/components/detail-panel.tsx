// Detail panel component - shows selected item details
import React from 'react'
import { Box, Text } from 'ink'

interface DetailPanelProps {
  item: Record<string, unknown> | null
  width: number
}

export function DetailPanel({ item, width }: DetailPanelProps) {
  if (!item) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text bold underline>DETAILS</Text>
        <Text dimColor italic>Select an item to view details</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold underline>DETAILS</Text>
      <Box marginTop={1} flexDirection="column">
        {renderFields(item, 0, width - 4)}
      </Box>
    </Box>
  )
}

function renderFields(obj: Record<string, unknown>, indent: number, maxWidth: number): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const pad = '  '.repeat(indent)

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue

    if (typeof value === 'object' && !Array.isArray(value)) {
      nodes.push(
        <Text key={key}>
          {pad}<Text color="yellow">{key}:</Text>
        </Text>
      )
      nodes.push(...renderFields(value as Record<string, unknown>, indent + 1, maxWidth))
    } else if (Array.isArray(value)) {
      const arrStr = value.length > 5
        ? `[${value.slice(0, 5).join(', ')}... +${value.length - 5}]`
        : value.join(', ')
      nodes.push(
        <Text key={key}>
          {pad}<Text color="yellow">{key}:</Text> {arrStr}
        </Text>
      )
    } else {
      const displayValue = String(value)
      const available = maxWidth - pad.length - key.length - 3
      const truncated = displayValue.length > available
        ? displayValue.slice(0, available - 3) + '...'
        : displayValue

      nodes.push(
        <Text key={key}>
          {pad}<Text color="yellow">{key}:</Text> {truncated}
        </Text>
      )
    }
  }

  return nodes
}
