import { useState, useEffect, useCallback } from 'react'
import { getSummary, getProviderStatus, clearCacheEntry, type LLMProvider } from '../lib/summary/index.js'
import { logManager } from '../lib/log-manager.js'

interface UseSummaryReturn {
  aiSummary: string | null
  aiError: string | null
  preview: string | null
  loading: boolean
  error: string | null
  provider: LLMProvider
  providerDescription: string
  refresh: () => void
  regenerate: () => Promise<void>
}

export function useSummary(filePath: string | undefined, itemType: string): UseSummaryReturn {
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const status = getProviderStatus()

  const loadSummary = useCallback(async () => {
    if (!filePath) {
      setAiSummary(null)
      setAiError(null)
      setPreview(null)
      return
    }

    setLoading(true)
    setError(null)
    setAiError(null)

    try {
      const result = await getSummary(filePath, itemType)
      setAiSummary(result.aiSummary)
      setAiError(result.aiError || null)
      setPreview(result.preview)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load'
      logManager.error('summary-hook', `Failed to load summary: ${msg}`)
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [filePath, itemType])

  // Regenerate: clear cache first, then reload
  const regenerate = useCallback(async () => {
    if (!filePath) return

    logManager.info('summary-hook', `Regenerating summary for: ${filePath}`)
    await clearCacheEntry(filePath)
    await loadSummary()
  }, [filePath, loadSummary])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  return {
    aiSummary,
    aiError,
    preview,
    loading,
    error,
    provider: status.provider,
    providerDescription: status.description,
    refresh: loadSummary,
    regenerate,
  }
}
