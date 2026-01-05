import React, { useState, useMemo } from 'react'
import { Box, Text, useInput } from 'ink'

interface ExpandableTextProps {
  content: string
  maxLines?: number
  width: number
  disabled?: boolean
}

export function ExpandableText({
  content,
  maxLines = 8,
  width,
  disabled
}: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false)

  // Calculate visual lines considering word wrap
  const { truncated, needsTruncation, totalVisualLines } = useMemo(() => {
    const effectiveWidth = Math.max(20, width - 2) // Account for padding
    const visualLines = calculateVisualLines(content, effectiveWidth)

    if (visualLines.length <= maxLines) {
      return {
        truncated: content,
        needsTruncation: false,
        totalVisualLines: visualLines.length
      }
    }

    // Rebuild truncated content from visual lines
    const truncatedVisualLines = visualLines.slice(0, maxLines)
    return {
      truncated: truncatedVisualLines.join('\n'),
      needsTruncation: true,
      totalVisualLines: visualLines.length
    }
  }, [content, maxLines, width])

  useInput((input, key) => {
    if (disabled) return
    if (key.return && needsTruncation) {
      setExpanded(e => !e)
    }
  })

  const remainingLines = totalVisualLines - maxLines

  if (!needsTruncation) {
    return <Text wrap="wrap">{content}</Text>
  }

  return (
    <Box flexDirection="column">
      <Text wrap="wrap">{expanded ? content : truncated}</Text>
      <Box marginTop={1}>
        <Text color="cyan">
          {expanded
            ? '[Enter: See less ↑]'
            : `[Enter: See more... +${remainingLines} lines]`}
        </Text>
      </Box>
    </Box>
  )
}

/**
 * Calculate how text will appear as visual lines after word wrapping
 */
function calculateVisualLines(text: string, maxWidth: number): string[] {
  const paragraphs = text.split('\n')
  const visualLines: string[] = []

  for (const paragraph of paragraphs) {
    if (paragraph.length === 0) {
      visualLines.push('')
      continue
    }

    if (paragraph.length <= maxWidth) {
      visualLines.push(paragraph)
      continue
    }

    // Word wrap long paragraphs
    const words = paragraph.split(' ')
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word

      if (testLine.length <= maxWidth) {
        currentLine = testLine
      } else {
        if (currentLine) {
          visualLines.push(currentLine)
        }
        // Handle very long words that exceed maxWidth
        if (word.length > maxWidth) {
          let remaining = word
          while (remaining.length > maxWidth) {
            visualLines.push(remaining.slice(0, maxWidth))
            remaining = remaining.slice(maxWidth)
          }
          currentLine = remaining
        } else {
          currentLine = word
        }
      }
    }

    if (currentLine) {
      visualLines.push(currentLine)
    }
  }

  return visualLines
}
