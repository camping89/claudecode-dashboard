import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { getCachedSummary, setCachedSummary } from './cache-manager.js'
import { logManager } from '../log-manager.js'

const OPENAI_MODEL = 'gpt-4o-mini'
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

async function generateAISummary(content: string, itemType: string): Promise<string> {
  const provider = getConfiguredProvider()
  const prompt = `You are a senior engineer reviewing this Claude Code ${itemType}.

Provide a structured analysis (keep it concise, ~500 words max):

**What it does:** 2-3 sentences explaining the core functionality and behavior.

**Key details:**
- Implementation: How it works technically (tools, patterns, integrations)
- Trigger: When/how it activates (events, commands, conditions)
- Scope: What it affects (files, sessions, permissions)

**Engineering notes:** 1-2 practical tips or gotchas.

Be specific and technical. Include actual values from the config. Ensure your response is COMPLETE - do not cut off mid-sentence.`
  const truncatedContent = content.slice(0, 4000)

  if (provider === 'anthropic') {
    const client = getAnthropic()
    if (!client) {
      logManager.error('ai', 'Anthropic client initialization failed')
      throw new Error('Anthropic client init failed')
    }

    try {
      const response = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1000,
        messages: [{ role: 'user', content: `${prompt}\n\n${truncatedContent}` }],
      })
      const textBlock = response.content.find(b => b.type === 'text')
      if (textBlock?.type === 'text') {
        logManager.info('ai', `Generated summary using ${CLAUDE_MODEL}`)
        return textBlock.text.trim()
      }
      logManager.error('ai', 'No text in Anthropic response')
      throw new Error('No text in Anthropic response')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      logManager.error('ai', `Anthropic API error: ${msg}`)
      throw e
    }
  }

  if (provider === 'openai') {
    const client = getOpenAI()
    if (!client) {
      logManager.error('ai', 'OpenAI client initialization failed')
      throw new Error('OpenAI client init failed')
    }

    try {
      const response = await client.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: truncatedContent },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      })
      const text = response.choices[0]?.message?.content?.trim()
      if (text) {
        logManager.info('ai', `Generated summary using ${OPENAI_MODEL}`)
        return text
      }
      logManager.error('ai', 'No text in OpenAI response')
      throw new Error('No text in OpenAI response')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      logManager.error('ai', `OpenAI API error: ${msg}`)
      throw e
    }
  }

  logManager.warn('ai', 'No AI provider configured')
  throw new Error('No AI provider configured')
}

export interface SummaryResult {
  aiSummary: string | null
  preview: string
  aiError?: string
}

export async function getSummary(filePath: string, itemType: string): Promise<SummaryResult> {
  if (!existsSync(filePath)) {
    logManager.warn('summary', `File not found: ${filePath}`)
    return { aiSummary: null, preview: '[File not found]' }
  }

  let content: string
  try {
    content = await readFile(filePath, 'utf-8')
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    logManager.error('summary', `Failed to read file ${filePath}: ${msg}`)
    return { aiSummary: null, preview: '[Failed to read file]' }
  }

  const preview = getMarkdownPreview(content)

  const cached = await getCachedSummary(filePath)
  if (cached) {
    logManager.info('summary', `Using cached summary for ${filePath}`)
    return { aiSummary: cached, preview: preview.text }
  }

  const provider = getConfiguredProvider()
  if (provider !== 'none') {
    try {
      const aiSummary = await generateAISummary(content, itemType)
      await setCachedSummary(filePath, aiSummary)
      return { aiSummary, preview: preview.text }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Unknown error'
      return { aiSummary: null, preview: preview.text, aiError: errMsg }
    }
  }

  return { aiSummary: null, preview: preview.text }
}

export function isOpenAIConfigured(): boolean {
  return getConfiguredProvider() !== 'none'
}
