import React from 'react'
import { Box, Text, useInput } from 'ink'

interface Tab {
  key: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (key: string) => void
  disabled?: boolean
}

export function Tabs({ tabs, activeTab, onTabChange, disabled }: TabsProps) {
  useInput((input, key) => {
    if (disabled) return

    const currentIndex = tabs.findIndex(t => t.key === activeTab)
    if (currentIndex === -1) return

    if (key.tab && !key.shift) {
      const nextIndex = (currentIndex + 1) % tabs.length
      onTabChange(tabs[nextIndex].key)
    } else if (key.tab && key.shift) {
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length
      onTabChange(tabs[prevIndex].key)
    }
  })

  return (
    <Box>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab
        return (
          <Box key={tab.key} marginRight={1}>
            <Text
              bold={isActive}
              color={isActive ? 'cyan' : undefined}
              dimColor={!isActive}
            >
              [{isActive ? '●' : ' '}] {tab.label}
            </Text>
          </Box>
        )
      })}
      <Text dimColor> (Tab ↔)</Text>
    </Box>
  )
}
