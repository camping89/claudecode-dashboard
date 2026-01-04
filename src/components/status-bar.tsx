// Status bar component - shows keyboard shortcuts and LLM provider status
import React from 'react'
import { Box, Text } from 'ink'
import { getProviderStatus } from '../lib/summary/index.js'

export function StatusBar() {
  const { provider, description } = getProviderStatus()
  const hasProvider = provider !== 'none'

  return (
    <Box borderStyle="single" paddingX={1} justifyContent="space-between">
      <Text dimColor>
        ↑↓ Navigate  ←→ Switch  r Refresh  q Quit
      </Text>
      <Text color={hasProvider ? 'green' : 'yellow'}>
        {hasProvider ? `● ${description}` : `○ ${description}`}
      </Text>
    </Box>
  )
}
