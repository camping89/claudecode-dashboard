import { readFile, writeFile, mkdir, stat } from 'fs/promises'
import { existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import { logManager } from '../log-manager.js'

interface CacheEntry {
  summary: string
  mtime: number
  generatedAt: number
}

interface CacheData {
  version: 1
  entries: Record<string, CacheEntry>
}

const CACHE_DIR = join(homedir(), '.claude', 'claudecode-dashboard')
const CACHE_FILE = join(CACHE_DIR, 'cache.json')

let memoryCache: CacheData | null = null

async function ensureCacheDir(): Promise<void> {
  if (!existsSync(CACHE_DIR)) {
    await mkdir(CACHE_DIR, { recursive: true })
  }
}

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
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    logManager.warn('cache', `Failed to load cache, starting fresh: ${msg}`)
    memoryCache = { version: 1, entries: {} }
    return memoryCache
  }
}

async function saveCache(): Promise<void> {
  if (!memoryCache) return
  try {
    await ensureCacheDir()
    await writeFile(CACHE_FILE, JSON.stringify(memoryCache, null, 2))
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    logManager.error('cache', `Failed to save cache: ${msg}`)
  }
}

async function getFileMtime(filePath: string): Promise<number> {
  try {
    const stats = await stat(filePath)
    return stats.mtimeMs
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    logManager.warn('cache', `Failed to get mtime for ${filePath}: ${msg}`)
    return 0
  }
}

export async function getCachedSummary(filePath: string): Promise<string | null> {
  const cache = await loadCache()
  const entry = cache.entries[filePath]

  if (!entry) return null

  const currentMtime = await getFileMtime(filePath)
  if (currentMtime !== entry.mtime) {
    delete cache.entries[filePath]
    await saveCache()
    return null
  }

  return entry.summary
}

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

export async function clearCache(): Promise<void> {
  memoryCache = { version: 1, entries: {} }
  await saveCache()
  logManager.info('cache', 'Cache cleared')
}

export async function clearCacheEntry(filePath: string): Promise<boolean> {
  const cache = await loadCache()
  if (cache.entries[filePath]) {
    delete cache.entries[filePath]
    await saveCache()
    logManager.info('cache', `Cache cleared for: ${filePath}`)
    return true
  }
  return false
}

export async function getCacheStats(): Promise<{ entries: number; size: number }> {
  const cache = await loadCache()
  const entries = Object.keys(cache.entries).length

  let size = 0
  if (existsSync(CACHE_FILE)) {
    try {
      const stats = await stat(CACHE_FILE)
      size = stats.size
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      logManager.warn('cache', `Failed to get cache file size: ${msg}`)
    }
  }

  return { entries, size }
}
