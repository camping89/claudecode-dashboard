// Hook for async summary loading with caching
// Returns AI summary if configured, otherwise 30-line preview
import { useState, useEffect, useCallback } from 'react'
import { getSummary, getProviderStatus, type LLMProvider } from '../lib/summary/index.js'

interface UseSummaryReturn {
  summary: string | null
  isAI: boolean
  loading: boolean
  error: string | null
  provider: LLMProvider
  providerDescription: string
  refresh: () => void
}

export function useSummary(filePath: string | undefined, itemType: string): UseSummaryReturn {
  const [summary, setSummary] = useState<string | null>(null)
  const [isAI, setIsAI] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const status = getProviderStatus()

  const loadSummary = useCallback(async () => {
    if (!filePath) {
      setSummary(null)
      setIsAI(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await getSummary(filePath, itemType)
      setSummary(result.text)
      setIsAI(result.isAI)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load summary')
    } finally {
      setLoading(false)
    }
  }, [filePath, itemType])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  return {
    summary,
    isAI,
    loading,
    error,
    provider: status.provider,
    providerDescription: status.description,
    refresh: loadSummary,
  }
}
