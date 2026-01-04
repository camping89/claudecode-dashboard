// Status bar component - shows keyboard shortcuts
import React from 'react'
import { Box, Text } from 'ink'

export function StatusBar() {
  return (
    <Box borderStyle="single" paddingX={1}>
      <Text dimColor>
        ↑↓ Navigate  ←→ Switch Panel  Enter Select  r Refresh  q Quit
      </Text>
    </Box>
  )
}
