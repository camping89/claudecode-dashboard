// Main App component - TUI container with keyboard handling
import React from 'react'
import { Box, Text, useApp, useInput, useStdout } from 'ink'
import Spinner from 'ink-spinner'
import { Layout } from './components/layout.js'
import { useConfig } from './hooks/use-config.js'
import { useNavigation } from './hooks/use-navigation.js'

interface AppProps {
  initialCategory?: string
}

export function App({ initialCategory }: AppProps) {
  const { exit } = useApp()
  const { stdout } = useStdout()
  const config = useConfig()
  const nav = useNavigation(config, initialCategory)

  useInput((input, key) => {
    if (input === 'q') exit()
    if (input === 'r') config.refresh()
    if (key.upArrow || input === 'k') nav.up()
    if (key.downArrow || input === 'j') nav.down()
    if (key.leftArrow || input === 'h') nav.left()
    if (key.rightArrow || input === 'l') nav.right()
    if (key.return) nav.select()
    if (key.pageUp || input === 'u') nav.pageUp()
    if (key.pageDown || input === 'd') nav.pageDown()
  })

  const width = stdout?.columns ?? 120
  const height = stdout?.rows ?? 30

  if (width < 80) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="yellow">Terminal too narrow ({width} cols)</Text>
        <Text>Minimum 80 columns required.</Text>
        <Text dimColor>Press q to quit.</Text>
      </Box>
    )
  }

  if (config.loading) {
    return (
      <Box padding={1}>
        <Text color="cyan">
          <Spinner type="dots" />
        </Text>
        <Text> Loading configurations...</Text>
      </Box>
    )
  }

  if (config.error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Error: {config.error}</Text>
        <Text dimColor>Press r to retry, q to quit.</Text>
      </Box>
    )
  }

  return <Layout config={config.data} nav={nav} width={Math.min(width, 160)} height={height} />
}
