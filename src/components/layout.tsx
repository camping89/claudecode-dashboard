// Layout component - main TUI layout with side panels
import React from 'react'
import { Box, Text } from 'ink'
import { CategoryMenu } from './category-menu.js'
import { ItemList } from './item-list.js'
import { DetailPanel } from './detail-panel.js'
import { StatusBar } from './status-bar.js'
import type { DashboardState } from '../lib/types.js'
import type { NavState } from '../hooks/use-navigation.js'

interface LayoutProps {
  config: DashboardState
  nav: NavState
  width: number
}

export function Layout({ config, nav, width }: LayoutProps) {
  const leftWidth = 32
  const rightWidth = width - leftWidth - 3

  return (
    <Box flexDirection="column" width={width}>
      {/* Header */}
      <Box borderStyle="single" paddingX={1}>
        <Text bold color="cyan">CC Dashboard</Text>
        <Box flexGrow={1} />
        <Text dimColor>Claude Code Config Viewer</Text>
      </Box>

      {/* Main content */}
      <Box height={18}>
        {/* Left panel */}
        <Box flexDirection="column" width={leftWidth} borderStyle="single" paddingX={1}>
          <CategoryMenu
            categories={nav.categories}
            selected={nav.categoryIndex}
            focused={nav.panel === 'category'}
          />
          <Box marginTop={1}>
            <ItemList
              items={nav.currentItems as Array<{ name: string; source?: string }>}
              selected={nav.itemIndex}
              focused={nav.panel === 'item'}
            />
          </Box>
        </Box>

        {/* Right panel */}
        <Box flexDirection="column" width={rightWidth} borderStyle="single">
          <DetailPanel
            item={nav.selectedItem as Record<string, unknown> | null}
            width={rightWidth}
          />
        </Box>
      </Box>

      {/* Status bar */}
      <StatusBar />
    </Box>
  )
}
