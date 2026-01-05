import React, { useState } from 'react'
import { Box, Text, useInput } from 'ink'
import Spinner from 'ink-spinner'
import { useSummary } from '../hooks/use-summary.js'
import { Tabs } from './tabs.js'
import { ExpandableText } from './expandable-text.js'

interface DetailPanelProps {
  item: Record<string, unknown> | null
  width: number
  maxHeight?: number
  category?: string
}

type TabKey = 'preview' | 'summary'

const TABS = [
  { key: 'preview', label: 'Preview' },
  { key: 'summary', label: 'AI Summary' },
] as const

export function DetailPanel({ item, width, maxHeight = 30, category }: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('preview')

  const filePath = item?.path as string | undefined
  const itemType = category || 'configuration'
  const { aiSummary, aiError, preview, loading, provider, regenerate } = useSummary(filePath, itemType)

  // R key to regenerate AI summary
  useInput((input) => {
    if ((input === 'r' || input === 'R') && activeTab === 'summary' && !loading) {
      regenerate()
    }
  })

  if (!item) {
    return (
      <Box flexDirection="column" paddingX={1}>
        <Text bold underline>DETAILS</Text>
        <Text dimColor italic>Select an item to view details</Text>
      </Box>
    )
  }

  const separator = '─'.repeat(Math.max(10, width - 4))

  // Calculate available height for tab content
  const propertiesLines = countPropertyLines(item)
  const headerLines = 6 // Headers, separators, tab bar, margins
  const availableForContent = Math.max(5, maxHeight - propertiesLines - headerLines)

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text bold underline>DETAILS</Text>

      <Box marginTop={1} flexDirection="column">
        <Text color="green" bold>Properties:</Text>
        {renderFields(item, 1, width - 4)}
      </Box>

      {filePath && (
        <Box marginTop={1} flexDirection="column">
          <Text dimColor>{separator}</Text>

          <Box marginTop={1}>
            <Tabs
              tabs={TABS as unknown as Array<{ key: string; label: string }>}
              activeTab={activeTab}
              onTabChange={(key) => setActiveTab(key as TabKey)}
            />
          </Box>

          <Box marginTop={1} flexDirection="column" minHeight={availableForContent}>
            {activeTab === 'preview' ? (
              <PreviewContent
                preview={preview}
                loading={loading}
                maxLines={availableForContent}
                width={width - 6}
              />
            ) : (
              <SummaryContent
                summary={aiSummary}
                error={aiError}
                loading={loading}
                provider={provider}
                maxLines={availableForContent - 2}
                width={width - 6}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}

interface PreviewContentProps {
  preview: string | null
  loading: boolean
  maxLines: number
  width: number
}

function PreviewContent({ preview, loading, maxLines, width }: PreviewContentProps) {
  if (loading) {
    return (
      <Text color="cyan">
        <Spinner type="dots" /> Loading preview...
      </Text>
    )
  }

  if (!preview) {
    return <Text dimColor italic>No content available</Text>
  }

  const truncated = truncateToLines(preview, maxLines, width)
  return <Text>{truncated}</Text>
}

interface SummaryContentProps {
  summary: string | null
  error: string | null
  loading: boolean
  provider: string
  maxLines: number
  width: number
}

function SummaryContent({ summary, error, loading, provider, maxLines, width }: SummaryContentProps) {
  if (provider === 'none') {
    return (
      <Box flexDirection="column">
        <Text dimColor italic>AI Summary not configured</Text>
        <Text dimColor>Export ANTHROPIC_API_KEY or OPENAI_API_KEY to enable</Text>
      </Box>
    )
  }

  if (loading) {
    return (
      <Text color="cyan">
        <Spinner type="dots" /> Generating summary...
      </Text>
    )
  }

  if (error) {
    return <Text color="red">Error: {error}</Text>
  }

  if (!summary) {
    return <Text dimColor italic>No summary available</Text>
  }

  return (
    <Box flexDirection="column">
      <ExpandableText content={summary} maxLines={maxLines - 1} width={width} />
      <Text dimColor> (R: regenerate)</Text>
    </Box>
  )
}

function countPropertyLines(obj: Record<string, unknown>): number {
  let count = 0
  for (const [, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue
    count++
    if (typeof value === 'object' && !Array.isArray(value)) {
      count += countPropertyLines(value as Record<string, unknown>)
    } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
      count += Math.min(value.length, 3)
      if (value.length > 3) count++
    }
  }
  return count
}

function truncateToLines(text: string, maxLines: number, maxWidth: number): string {
  const lines = text.split('\n')

  const lastLine = lines[lines.length - 1] || ''
  const hasEOF = lastLine.includes('<EOF>')
  const hasMoreLines = lastLine.includes('... (') && lastLine.includes('more lines)')
  const hasSeparator = lines.length >= 2 && lines[lines.length - 2]?.startsWith('───')

  const footerLines = (hasEOF || hasMoreLines) ? (hasSeparator ? 2 : 1) : 0
  const contentMaxLines = maxLines - footerLines

  const wrapped: string[] = []
  const contentLines = footerLines > 0 ? lines.slice(0, -footerLines) : lines

  for (const line of contentLines) {
    if (wrapped.length >= contentMaxLines) break

    if (line.length <= maxWidth) {
      wrapped.push(line)
    } else {
      const words = line.split(' ')
      let current = ''
      for (const word of words) {
        if (wrapped.length >= contentMaxLines) break
        if ((current + ' ' + word).trim().length <= maxWidth) {
          current = (current + ' ' + word).trim()
        } else {
          if (current) wrapped.push(current)
          current = word
        }
      }
      if (current && wrapped.length < contentMaxLines) wrapped.push(current)
    }
  }

  const wasTruncated = wrapped.length < contentLines.length
  if (wasTruncated && wrapped.length > 0) {
    wrapped[wrapped.length - 1] = wrapped[wrapped.length - 1].slice(0, maxWidth - 15) + '... [truncated]'
  }

  if (footerLines > 0) {
    if (hasSeparator && footerLines === 2) {
      wrapped.push(lines[lines.length - 2])
    }
    wrapped.push(lastLine)
  }

  return wrapped.join('\n')
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
      if (value.length === 0) {
        nodes.push(
          <Text key={key}>
            {pad}<Text color="yellow">{key}:</Text> <Text dimColor>[]</Text>
          </Text>
        )
      } else if (typeof value[0] === 'object' && value[0] !== null) {
        nodes.push(
          <Text key={key}>
            {pad}<Text color="yellow">{key}:</Text> <Text dimColor>[{value.length} items]</Text>
          </Text>
        )
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
