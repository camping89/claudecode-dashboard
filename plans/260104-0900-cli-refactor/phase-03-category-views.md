# Phase 3: Category Views

**Status:** Pending
**Estimated Files:** 4

---

## Objective

Build the category menu, item list, and detail panel components.

---

## Tasks

### 3.1 Create CategoryMenu - `src/components/category-menu.tsx`

```tsx
import React from 'react'
import { Box, Text } from 'ink'

interface Category {
  key: string
  label: string
  count: number
}

interface CategoryMenuProps {
  categories: Category[]
  selected: number
  focused: boolean
}

export function CategoryMenu({ categories, selected, focused }: CategoryMenuProps) {
  return (
    <Box flexDirection="column">
      <Text bold underline>CATEGORIES</Text>
      {categories.map((cat, i) => {
        const isSelected = i === selected
        const prefix = isSelected ? (focused ? '▸ ' : '› ') : '  '
        const color = isSelected ? (focused ? 'cyan' : 'white') : 'gray'

        return (
          <Text key={cat.key} color={color}>
            {prefix}{cat.label} ({cat.count})
          </Text>
        )
      })}
    </Box>
  )
}
```

### 3.2 Create ItemList - `src/components/item-list.tsx`

```tsx
import React from 'react'
import { Box, Text } from 'ink'

interface Item {
  name: string
  source?: string
}

interface ItemListProps {
  items: Item[]
  selected: number
  focused: boolean
}

export function ItemList({ items, selected, focused }: ItemListProps) {
  if (items.length === 0) {
    return (
      <Box flexDirection="column">
        <Text bold underline>ITEMS</Text>
        <Text dimColor italic>No items</Text>
      </Box>
    )
  }

  // Show max 10 items with scroll indicator
  const maxVisible = 10
  const start = Math.max(0, selected - Math.floor(maxVisible / 2))
  const visible = items.slice(start, start + maxVisible)

  return (
    <Box flexDirection="column">
      <Text bold underline>ITEMS</Text>
      {start > 0 && <Text dimColor>  ↑ {start} more</Text>}
      {visible.map((item, i) => {
        const actualIndex = start + i
        const isSelected = actualIndex === selected
        const prefix = isSelected ? (focused ? '▸ ' : '› ') : '  '
        const color = isSelected ? (focused ? 'cyan' : 'white') : 'gray'

        // Truncate name to fit
        const name = item.name.length > 20 ? item.name.slice(0, 17) + '...' : item.name
        const source = item.source ?? ''

        return (
          <Text key={item.name} color={color}>
            {prefix}{name.padEnd(20)} <Text dimColor>{source}</Text>
          </Text>
        )
      })}
      {start + maxVisible < items.length && (
        <Text dimColor>  ↓ {items.length - start - maxVisible} more</Text>
      )}
    </Box>
  )
}
```

### 3.3 Create DetailPanel - `src/components/detail-panel.tsx`

```tsx
import React from 'react'
import { Box, Text } from 'ink'

interface DetailPanelProps {
  item: Record<string, unknown> | null
}

export function DetailPanel({ item }: DetailPanelProps) {
  if (!item) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold underline>DETAILS</Text>
        <Text dimColor italic>Select an item to view details</Text>
      </Box>
    )
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold underline>DETAILS</Text>
      <Box marginTop={1} flexDirection="column">
        {renderFields(item)}
      </Box>
    </Box>
  )
}

function renderFields(obj: Record<string, unknown>, indent = 0): React.ReactNode[] {
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
      nodes.push(...renderFields(value as Record<string, unknown>, indent + 1))
    } else if (Array.isArray(value)) {
      nodes.push(
        <Text key={key}>
          {pad}<Text color="yellow">{key}:</Text> {value.join(', ')}
        </Text>
      )
    } else {
      const displayValue = String(value)
      const truncated = displayValue.length > 60
        ? displayValue.slice(0, 57) + '...'
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
```

### 3.4 Add Description Panel for Long Text - `src/components/description-box.tsx`

```tsx
import React from 'react'
import { Box, Text } from 'ink'

interface DescriptionBoxProps {
  text: string
  width: number
}

export function DescriptionBox({ text, width }: DescriptionBoxProps) {
  // Word wrap text to width
  const lines = wrapText(text, width - 4)

  return (
    <Box flexDirection="column" marginTop={1}>
      <Text color="yellow">description:</Text>
      {lines.map((line, i) => (
        <Text key={i} dimColor>{line}</Text>
      ))}
    </Box>
  )
}

function wrapText(text: string, width: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    if (current.length + word.length + 1 > width) {
      lines.push(current)
      current = word
    } else {
      current = current ? `${current} ${word}` : word
    }
  }
  if (current) lines.push(current)

  return lines.slice(0, 5) // Max 5 lines
}
```

---

## Validation

```bash
bun run dev

# Should show:
# - Category list with counts
# - Item list with scroll
# - Detail panel with field values
```

---

## Files Created

| File | Purpose |
|------|---------|
| `src/components/category-menu.tsx` | Category navigation |
| `src/components/item-list.tsx` | Scrollable item list |
| `src/components/detail-panel.tsx` | Item details renderer |
| `src/components/description-box.tsx` | Word-wrapped long text |
