// AI-powered summarizer for markdown files
// Supports OpenAI (GPT-5.2+) and Anthropic (Claude) APIs
// Falls back to 30-line markdown preview if no API key
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { getCachedSummary, setCachedSummary } from './cache-manager.js'

// Supported models - using latest efficient models
const OPENAI_MODEL = 'gpt-5.2-mini'  // GPT-5.2 mini for fast, cheap summaries
const CLAUDE_MODEL = 'claude-haiku-4-5-latest'  // Haiku 4.5 for efficiency

let openaiClient: OpenAI | null = null
let anthropicClient: Anthropic | null = null

// Provider detection
export type LLMProvider = 'openai' | 'anthropic' | 'none'

export function getConfiguredProvider(): LLMProvider {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  if (process.env.OPENAI_API_KEY) return 'openai'
  return 'none'
}

export function getProviderStatus(): { provider: LLMProvider; description: string } {
  const provider = getConfiguredProvider()
  switch (provider) {
    case 'anthropic':
      return { provider, description: `Claude AI (${CLAUDE_MODEL})` }
    case 'openai':
      return { provider, description: `OpenAI (${OPENAI_MODEL})` }
    case 'none':
      return {
        provider,
        description: 'Set ANTHROPIC_API_KEY or OPENAI_API_KEY for AI summaries'
      }
  }
}

// Initialize clients lazily
function getOpenAI(): OpenAI | null {
  if (openaiClient) return openaiClient
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  openaiClient = new OpenAI({ apiKey })
  return openaiClient
}

function getAnthropic(): Anthropic | null {
  if (anthropicClient) return anthropicClient
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null
  anthropicClient = new Anthropic({ apiKey })
  return anthropicClient
}

// Extract first N lines from markdown (fallback preview)
function getMarkdownPreview(content: string, lines: number = 30): string {
  const allLines = content.split('\n')
  const preview = allLines.slice(0, lines)

  // Remove frontmatter if present
  if (preview[0] === '---') {
    const endIdx = preview.findIndex((line, i) => i > 0 && line === '---')
    if (endIdx > 0) {
      preview.splice(0, endIdx + 1)
    }
  }

  const result = preview.join('\n').trim()
  const hasMore = allLines.length > lines
  return hasMore ? result + '\n...' : result
}

// Generate summary using configured provider
async function generateAISummary(content: string, itemType: string): Promise<string | null> {
  const provider = getConfiguredProvider()
  const prompt = `Summarize this ${itemType} in 2-3 sentences. Focus on: what it does, key features, when to use it. Be direct and technical.`
  const truncatedContent = content.slice(0, 4000)

  if (provider === 'anthropic') {
    const client = getAnthropic()
    if (!client) return null

    try {
      const response = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 150,
        messages: [{ role: 'user', content: `${prompt}\n\n${truncatedContent}` }],
      })
      const textBlock = response.content.find(b => b.type === 'text')
      return textBlock?.type === 'text' ? textBlock.text.trim() : null
    } catch (error) {
      console.error('Anthropic error:', error)
      return null
    }
  }

  if (provider === 'openai') {
    const client = getOpenAI()
    if (!client) return null

    try {
      const response = await client.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: truncatedContent },
        ],
        max_tokens: 150,
        temperature: 0.3,
      })
      return response.choices[0]?.message?.content?.trim() || null
    } catch (error) {
      console.error('OpenAI error:', error)
      return null
    }
  }

  return null
}

// Get summary for a file (cached → AI → preview fallback)
export async function getSummary(filePath: string, itemType: string): Promise<{ text: string; isAI: boolean }> {
  if (!existsSync(filePath)) {
    return { text: '[File not found]', isAI: false }
  }

  // Check cache first
  const cached = await getCachedSummary(filePath)
  if (cached) {
    return { text: cached, isAI: true }
  }

  // Read file content
  let content: string
  try {
    content = await readFile(filePath, 'utf-8')
  } catch {
    return { text: '[Failed to read file]', isAI: false }
  }

  // Try AI summary if configured
  const provider = getConfiguredProvider()
  if (provider !== 'none') {
    const aiSummary = await generateAISummary(content, itemType)
    if (aiSummary) {
      await setCachedSummary(filePath, aiSummary)
      return { text: aiSummary, isAI: true }
    }
  }

  // Fallback to 30-line preview
  return { text: getMarkdownPreview(content, 30), isAI: false }
}

// Legacy compatibility
export function isOpenAIConfigured(): boolean {
  return getConfiguredProvider() !== 'none'
}
