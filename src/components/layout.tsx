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
  height: number
}

export function Layout({ config, nav, width, height }: LayoutProps) {
  const categoryWidth = 22
  const itemWidth = 30
  const detailWidth = width - categoryWidth - itemWidth - 6  // 6 for borders

  // Use full terminal height: subtract header (3) + status bar (1) + borders (2)
  const contentHeight = Math.max(10, height - 6)

  return (
    <Box flexDirection="column" width={width}>
      {/* Header */}
      <Box borderStyle="single" paddingX={1}>
        <Text bold color="cyan">CC Dashboard</Text>
        <Box flexGrow={1} />
        <Text dimColor>Claude Code Config Viewer</Text>
      </Box>

      {/* Main content - horizontal tree layout */}
      <Box height={contentHeight}>
        {/* Categories panel */}
        <Box flexDirection="column" width={categoryWidth} borderStyle="single" paddingX={1}>
          <CategoryMenu
            categories={nav.categories}
            selected={nav.categoryIndex}
            focused={nav.panel === 'category'}
          />
        </Box>

        {/* Items panel */}
        <Box flexDirection="column" width={itemWidth} borderStyle="single" paddingX={1}>
          <ItemList
            items={nav.currentItems as Array<{ name: string; source?: string }>}
            selected={nav.itemIndex}
            focused={nav.panel === 'item'}
            maxHeight={contentHeight - 4}
          />
        </Box>

        {/* Details panel */}
        <Box flexDirection="column" width={detailWidth} borderStyle="single">
          <DetailPanel
            item={nav.selectedItem as Record<string, unknown> | null}
            width={detailWidth}
            maxHeight={contentHeight - 2}
            category={nav.categories[nav.categoryIndex]?.key}
          />
        </Box>
      </Box>

      {/* Status bar */}
      <StatusBar />
    </Box>
  )
}
