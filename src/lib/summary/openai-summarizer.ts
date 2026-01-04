import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { getCachedSummary, setCachedSummary } from './cache-manager.js'

const OPENAI_MODEL = 'gpt-5.2-mini'
const CLAUDE_MODEL = 'claude-haiku-4-5-latest'

let openaiClient: OpenAI | null = null
let anthropicClient: Anthropic | null = null

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

export const PREVIEW_LINE_COUNT = 30

function sanitizeForTUI(text: string): string {
  return text
    .replace(/\|/g, '│')
    .replace(/─{3,}/g, '───')
}

function getMarkdownPreview(content: string, maxLines: number = PREVIEW_LINE_COUNT): { text: string; isEOF: boolean } {
  const allLines = content.split('\n')
  let preview = allLines.slice(0, maxLines)

  if (preview[0] === '---') {
    const endIdx = preview.findIndex((line, i) => i > 0 && line === '---')
    if (endIdx > 0) {
      preview.splice(0, endIdx + 1)
    }
  }

  const isEOF = allLines.length <= maxLines
  let result = preview.join('\n').trim()
  result = sanitizeForTUI(result)

  if (isEOF) {
    result += '\n───────────────────────────\n<EOF>'
  } else {
    result += `\n───────────────────────────\n... (${allLines.length - maxLines} more lines)`
  }

  return { text: result, isEOF }
}

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

export async function getSummary(filePath: string, itemType: string): Promise<{ text: string; isAI: boolean }> {
  if (!existsSync(filePath)) {
    return { text: '[File not found]', isAI: false }
  }

  const cached = await getCachedSummary(filePath)
  if (cached) {
    return { text: cached, isAI: true }
  }

  let content: string
  try {
    content = await readFile(filePath, 'utf-8')
  } catch {
    return { text: '[Failed to read file]', isAI: false }
  }

  const provider = getConfiguredProvider()
  if (provider !== 'none') {
    const aiSummary = await generateAISummary(content, itemType)
    if (aiSummary) {
      await setCachedSummary(filePath, aiSummary)
      return { text: aiSummary, isAI: true }
    }
  }

  const preview = getMarkdownPreview(content)
  return { text: preview.text, isAI: false }
}

export function isOpenAIConfigured(): boolean {
  return getConfiguredProvider() !== 'none'
}
