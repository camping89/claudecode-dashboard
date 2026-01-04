// Cache manager for AI-generated summaries
// Stores summaries in ~/.claude/cc-dashboard/cache.json
import { readFile, writeFile, mkdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

interface CacheEntry {
  summary: string
  mtime: number  // File modification time when summary was generated
  generatedAt: number
}

interface CacheData {
  version: 1
  entries: Record<string, CacheEntry>
}

const CACHE_DIR = join(homedir(), '.claude', 'cc-dashboard')
const CACHE_FILE = join(CACHE_DIR, 'cache.json')

let memoryCache: CacheData | null = null

// Ensure cache directory exists
async function ensureCacheDir(): Promise<void> {
  if (!existsSync(CACHE_DIR)) {
    await mkdir(CACHE_DIR, { recursive: true })
  }
}

// Load cache from disk
async function loadCache(): Promise<CacheData> {
  if (memoryCache) return memoryCache

  await ensureCacheDir()

  if (!existsSync(CACHE_FILE)) {
    memoryCache = { version: 1, entries: {} }
    return memoryCache
  }

  try {
    const content = await readFile(CACHE_FILE, 'utf-8')
    memoryCache = JSON.parse(content) as CacheData
    return memoryCache
  } catch {
    memoryCache = { version: 1, entries: {} }
    return memoryCache
  }
}

// Save cache to disk
async function saveCache(): Promise<void> {
  if (!memoryCache) return
  await ensureCacheDir()
  await writeFile(CACHE_FILE, JSON.stringify(memoryCache, null, 2))
}

// Get file modification time
async function getFileMtime(filePath: string): Promise<number> {
  try {
    const stats = await stat(filePath)
    return stats.mtimeMs
  } catch {
    return 0
  }
}

// Get cached summary if valid (file hasn't changed)
export async function getCachedSummary(filePath: string): Promise<string | null> {
  const cache = await loadCache()
  const entry = cache.entries[filePath]

  if (!entry) return null

  // Check if file has been modified since summary was generated
  const currentMtime = await getFileMtime(filePath)
  if (currentMtime !== entry.mtime) {
    // File changed, invalidate cache
    delete cache.entries[filePath]
    await saveCache()
    return null
  }

  return entry.summary
}

// Store summary in cache
export async function setCachedSummary(filePath: string, summary: string): Promise<void> {
  const cache = await loadCache()
  const mtime = await getFileMtime(filePath)

  cache.entries[filePath] = {
    summary,
    mtime,
    generatedAt: Date.now(),
  }

  await saveCache()
}

// Clear all cached summaries
export async function clearCache(): Promise<void> {
  memoryCache = { version: 1, entries: {} }
  await saveCache()
}

// Get cache stats
export async function getCacheStats(): Promise<{ entries: number; size: number }> {
  const cache = await loadCache()
  const entries = Object.keys(cache.entries).length

  let size = 0
  if (existsSync(CACHE_FILE)) {
    const stats = await stat(CACHE_FILE)
    size = stats.size
  }

  return { entries, size }
}
