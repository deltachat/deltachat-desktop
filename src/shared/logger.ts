import { parse } from 'error-stack-parser'
import { RC_Config } from './shared-types'
const startTime = Date.now()

export const colorize = (light: number, code: number) => (str: string) =>
  '\x1B[' + light + ';' + code + 'm' + str + '\x1b[0m'
export const blue = colorize(1, 34)
export const red = colorize(1, 31)
export const yellow = colorize(1, 33)
export const grey = colorize(0, 37)
export const green = colorize(1, 37)
export const cyan = colorize(1, 36)

const emojiFontCss =
  'font-family: Roboto, "Apple Color Emoji", NotoEmoji, "Helvetica Neue", Arial, Helvetica, NotoMono, sans-serif !important;'

const LoggerVariants = [
  { log: console.debug, level: 'DEBUG', emoji: '🕸️', symbol: '[D]' },
  { log: console.info, level: 'INFO', emoji: 'ℹ️', symbol: blue('[i]') },
  {
    log: console.warn,
    level: 'WARNING',
    emoji: '⚠️',
    symbol: yellow('[w]'),
  },
  {
    log: console.error,
    level: 'ERROR',
    emoji: '🚨',
    symbol: red('[E]'),
  },
  {
    log: console.error,
    level: 'CRITICAL',
    emoji: '🚨🚨',
    symbol: red('[C]'),
  },
]

export function printProcessLogLevelInfo() {
  /* ignore-console-log */
  console.info(
    `%cLogging Levels:\n${LoggerVariants.map(v => `${v.emoji} ${v.level}`).join(
      '\n'
    )}`,
    emojiFontCss
  )
}

type LogHandlerFunction = (
  channel: string,
  level: string,
  stacktrace: ReturnType<typeof getStackTrace>,
  ...args: any[]
) => void

let handler: LogHandlerFunction
let rc: RC_Config = {} as any

export function setLogHandler(
  LogHandler: LogHandlerFunction,
  rcObject: RC_Config
) {
  handler = LogHandler
  // get a clean, non-remote object that has just the values
  rc = JSON.parse(JSON.stringify(rcObject))
}

function log(
  { channel, isMainProcess }: Logger,
  level: number,
  stacktrace: ReturnType<typeof getStackTrace>,
  args: any[]
) {
  const variant = LoggerVariants[level]
  if (!handler) {
    /* ignore-console-log */
    console.log('Failed to log message - Handler not initilized yet')
    /* ignore-console-log */
    console.log(`Log Message: ${channel} ${level} ${args.join(' ')}`)
    throw Error('Failed to log message - Handler not initilized yet')
  }
  handler(channel, variant.level, stacktrace, ...args)
  if (rc['log-to-console']) {
    if (isMainProcess) {
      const begining = `${Math.round((Date.now() - startTime) / 100) / 10}s ${
        LoggerVariants[level].symbol
      }${grey(channel)}:`
      if (!stacktrace) {
        /* ignore-console-log */
        console.log(begining, ...args)
      } else {
        /* ignore-console-log */
        console.log(
          begining,
          ...args,
          red(
            Array.isArray(stacktrace)
              ? stacktrace.map(s => `\n${s.toString()}`).join()
              : stacktrace
          )
        )
      }
    } else {
      const prefix = `%c${variant.emoji}%c${channel}`
      const prefixStyle = [emojiFontCss, 'color:blueviolet;']

      if (stacktrace) {
        variant.log(prefix, ...prefixStyle, stacktrace, ...args)
      } else {
        variant.log(prefix, ...prefixStyle, ...args)
      }
    }
  }
}

function getStackTrace() {
  const rawStack = parse(new Error('Get Stacktrace'))
  const stack = rawStack.slice(2, rawStack.length)
  return rc['machine-readable-stacktrace']
    ? stack
    : stack.map(s => `\n${s.toString()}`).join()
}

export class Logger {
  isMainProcess = typeof window === 'undefined'
  constructor(public readonly channel: string) {}

  debug(...args: any[]) {
    if (!rc['log-debug']) return
    log(this, 0, undefined, args)
  }

  info(...args: any[]) {
    log(this, 1, undefined, args)
  }

  warn(...args: any[]) {
    log(this, 2, getStackTrace(), args)
  }

  error(...args: any[]) {
    log(this, 3, getStackTrace(), args)
  }

  critical(...args: any[]) {
    log(this, 4, getStackTrace(), args)
  }
}

export function getLogger(channel: string) {
  return new Logger(channel)
}
