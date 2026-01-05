import { appendFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'

// Structured log entry with metadata support
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  source: string
  message: string
  timestamp: Date
  meta?: Record<string, unknown>
}

// Sink interface - implement this to add new log destinations
export interface LogSink {
  name: string
  write(entry: LogEntry): void | Promise<void>
  flush?(): void | Promise<void>
}

// Memory sink - keeps entries in memory for TUI subscription
export class MemorySink implements LogSink {
  name = 'memory'
  private entries: LogEntry[] = []
  private listeners: Set<(entries: LogEntry[]) => void> = new Set()
  private maxEntries: number

  constructor(maxEntries = 100) {
    this.maxEntries = maxEntries
  }

  write(entry: LogEntry): void {
    this.entries.push(entry)
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries)
    }
    this.notifyListeners()
  }

  getEntries(): LogEntry[] {
    return [...this.entries]
  }

  getRecent(count: number): LogEntry[] {
    return this.entries.slice(-count)
  }

  subscribe(listener: (entries: LogEntry[]) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  clear(): void {
    this.entries = []
    this.notifyListeners()
  }

  private notifyListeners(): void {
    const entries = this.getEntries()
    this.listeners.forEach(fn => fn(entries))
  }
}

// File sink - writes JSON lines to log file
export class FileSink implements LogSink {
  name = 'file'
  private logDir: string
  private logFile: string
  private buffer: string[] = []
  private flushInterval: ReturnType<typeof setInterval> | null = null
  private initialized = false

  constructor(logDir?: string) {
    this.logDir = logDir || join(homedir(), '.claude', 'claudecode-dashboard', 'logs')
    const date = new Date().toISOString().split('T')[0]
    this.logFile = join(this.logDir, `${date}.jsonl`)
  }

  private async ensureDir(): Promise<void> {
    if (this.initialized) return
    if (!existsSync(this.logDir)) {
      await mkdir(this.logDir, { recursive: true })
    }
    this.initialized = true
  }

  async write(entry: LogEntry): Promise<void> {
    const line = JSON.stringify({
      ts: entry.timestamp.toISOString(),
      lvl: entry.level,
      src: entry.source,
      msg: entry.message,
      ...(entry.meta && { meta: entry.meta }),
    })
    this.buffer.push(line)

    // Auto-flush on error level or when buffer gets large
    if (entry.level === 'error' || this.buffer.length >= 10) {
      await this.flush()
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return
    await this.ensureDir()
    const content = this.buffer.join('\n') + '\n'
    this.buffer = []
    await appendFile(this.logFile, content)
  }

  startAutoFlush(intervalMs = 5000): void {
    if (this.flushInterval) return
    this.flushInterval = setInterval(() => this.flush(), intervalMs)
  }

  stopAutoFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
  }
}

// Main logger class with sink support
class Logger {
  private sinks: LogSink[] = []
  private minLevel: LogLevel = 'info'
  private levelOrder: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  addSink(sink: LogSink): void {
    this.sinks.push(sink)
  }

  removeSink(name: string): void {
    this.sinks = this.sinks.filter(s => s.name !== name)
  }

  getSink<T extends LogSink>(name: string): T | undefined {
    return this.sinks.find(s => s.name === name) as T | undefined
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelOrder[level] >= this.levelOrder[this.minLevel]
  }

  log(level: LogLevel, source: string, message: string, meta?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      level,
      source,
      message,
      timestamp: new Date(),
      meta,
    }

    for (const sink of this.sinks) {
      try {
        sink.write(entry)
      } catch {
        // Sink write failed - can't log this error or we'd recurse
      }
    }
  }

  debug(source: string, message: string, meta?: Record<string, unknown>): void {
    this.log('debug', source, message, meta)
  }

  info(source: string, message: string, meta?: Record<string, unknown>): void {
    this.log('info', source, message, meta)
  }

  warn(source: string, message: string, meta?: Record<string, unknown>): void {
    this.log('warn', source, message, meta)
  }

  error(source: string, message: string, meta?: Record<string, unknown>): void {
    this.log('error', source, message, meta)
  }

  async flush(): Promise<void> {
    for (const sink of this.sinks) {
      if (sink.flush) {
        await sink.flush()
      }
    }
  }
}

// Create singleton with default sinks
const memorySink = new MemorySink(100)
const fileSink = new FileSink()

export const logManager = new Logger()
logManager.addSink(memorySink)
logManager.addSink(fileSink)

// Export memory sink for TUI subscription
export function getMemorySink(): MemorySink {
  return memorySink
}

// Convenience re-exports for backward compatibility
export function getEntries(): LogEntry[] {
  return memorySink.getEntries()
}

export function getRecentEntries(count: number = 10): LogEntry[] {
  return memorySink.getRecent(count)
}

export function subscribe(listener: (entries: LogEntry[]) => void): () => void {
  return memorySink.subscribe(listener)
}
