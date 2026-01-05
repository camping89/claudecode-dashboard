import React from 'react'
import { Box, Text } from 'ink'
import { CategoryMenu } from './category-menu.js'
import { ItemList } from './item-list.js'
import { DetailPanel } from './detail-panel.js'
import { StatusBar } from './status-bar.js'
import { LogPanel } from './log-panel.js'
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
  const detailWidth = width - categoryWidth - itemWidth - 6
  const logHeight = 6

  const contentHeight = Math.max(10, height - 6 - logHeight)

  return (
    <Box flexDirection="column" width={width}>
      <Box borderStyle="single" paddingX={1}>
        <Text bold color="cyan">ClaudeCode Dashboard</Text>
        <Box flexGrow={1} />
        <Text dimColor>Claude Code Config Viewer</Text>
      </Box>

      <Box height={contentHeight}>
        <Box flexDirection="column" width={categoryWidth} borderStyle="single" paddingX={1}>
          <CategoryMenu
            categories={nav.categories}
            selected={nav.categoryIndex}
            focused={nav.panel === 'category'}
          />
        </Box>

        <Box flexDirection="column" width={itemWidth} borderStyle="single" paddingX={1}>
          <ItemList
            items={nav.currentItems as Array<{ name: string; source?: string }>}
            selected={nav.itemIndex}
            focused={nav.panel === 'item'}
            maxHeight={contentHeight - 4}
          />
        </Box>

        <Box flexDirection="column" width={detailWidth} borderStyle="single">
          <DetailPanel
            item={nav.selectedItem as Record<string, unknown> | null}
            width={detailWidth}
            maxHeight={contentHeight - 2}
            category={nav.categories[nav.categoryIndex]?.key}
          />
        </Box>
      </Box>

      <LogPanel height={logHeight} />

      <StatusBar />
    </Box>
  )
}
