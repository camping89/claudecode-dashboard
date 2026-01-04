// Detail panel component - shows selected item details with AI summaries
import React from 'react'
import { Box, Text } from 'ink'
import Spinner from 'ink-spinner'
import { useSummary } from '../hooks/use-summary.js'

interface DetailPanelProps {
  item: Record<string, unknown> | null
  width: number
  maxHeight?: number
  category?: string
}

export function DetailPanel({ item, width, maxHeight, category }: DetailPanelProps) {
  // Get path for summary (skills, agents, commands have paths)
  const filePath = item?.path as string | undefined
  const itemType = category || 'configuration'
  const { summary, isAI, loading, provider } = useSummary(filePath, itemType)

  if (!item) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text bold underline>DETAILS</Text>
        <Text dimColor italic>Select an item to view details</Text>
      </Box>
    )
  }

  // Determine section title based on content type
  const summaryTitle = isAI ? 'AI Summary' : 'Preview'
  const summaryColor = isAI ? 'magenta' : 'blue'

  // Create separator line
  const separator = '─'.repeat(Math.max(10, width - 4))

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold underline>DETAILS</Text>

      {/* Properties section (top) */}
      <Box marginTop={1} flexDirection="column">
        <Text color="green" bold>Properties:</Text>
        {renderFields(item, 1, width - 4)}
      </Box>

      {/* Separator + Preview/Summary section (bottom) */}
      {filePath && (
        <Box marginTop={1} flexDirection="column">
          <Text dimColor>{separator}</Text>
          <Box marginTop={1} flexDirection="column">
            <Text color={summaryColor} bold>
              {summaryTitle}:
              {!isAI && provider === 'none' && (
                <Text dimColor> (set API key for AI)</Text>
              )}
            </Text>
            <Box marginLeft={1} flexDirection="column">
              {loading ? (
                <Text color="cyan">
                  <Spinner type="dots" /> {provider !== 'none' ? 'Generating AI summary...' : 'Loading...'}
                </Text>
              ) : summary ? (
                <Text wrap="wrap">{wrapText(summary, width - 6)}</Text>
              ) : (
                <Text dimColor italic>No content available</Text>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

// Word-wrap text to fit width
function wrapText(text: string, maxWidth: number): string {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    if ((currentLine + ' ' + word).trim().length <= maxWidth) {
      currentLine = (currentLine + ' ' + word).trim()
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }
  if (currentLine) lines.push(currentLine)

  return lines.join('\n')
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
      // Handle arrays - check if items are objects
      if (value.length === 0) {
        nodes.push(
          <Text key={key}>
            {pad}<Text color="yellow">{key}:</Text> <Text dimColor>[]</Text>
          </Text>
        )
      } else if (typeof value[0] === 'object' && value[0] !== null) {
        // Array of objects - show as expandable list
        nodes.push(
          <Text key={key}>
            {pad}<Text color="yellow">{key}:</Text> <Text dimColor>[{value.length} items]</Text>
          </Text>
        )
        // Show first few items inline
        value.slice(0, 3).forEach((item, i) => {
          const label = (item as Record<string, unknown>).name
            || (item as Record<string, unknown>).event
            || (item as Record<string, unknown>).command
            || `[${i}]`
          nodes.push(
            <Text key={`${key}-${i}`}>
              {pad}  <Text dimColor>• {String(label).slice(0, maxWidth - indent * 2 - 6)}</Text>
            </Text>
          )
        })
        if (value.length > 3) {
          nodes.push(
            <Text key={`${key}-more`}>
              {pad}  <Text dimColor>... +{value.length - 3} more</Text>
            </Text>
          )
        }
      } else {
        // Array of primitives - join as string
        const arrStr = value.length > 5
          ? `[${value.slice(0, 5).join(', ')}... +${value.length - 5}]`
          : `[${value.join(', ')}]`
        nodes.push(
          <Text key={key}>
            {pad}<Text color="yellow">{key}:</Text> {arrStr}
          </Text>
        )
      }
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
