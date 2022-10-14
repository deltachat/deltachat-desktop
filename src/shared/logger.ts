import errorStackParser from 'error-stack-parser'
import StackFrame from 'stackframe'
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
  console.info(
    `# Tips and Tricks for working with the browser console:
## Use the search to filter the output like:
space seperate terms, exclude with -, if your term contains spaces you should exape it with "

-👻                 don't show events from background accounts (not selected accounts)
-📡                 don't show any events
-renderer/jsonrpc   don't show jsonrpc messages
renderer/jsonrpc    show only jsonrpc messages

Start deltachat with --devmode (or --log-debug and --log-to-console) argument to show full log output.
  `
  )
}

export type LogHandlerFunction = (
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
  rc = rcObject
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
    console.log('Failed to log message - Handler not initialized yet')
    /* ignore-console-log */
    console.log(`Log Message: ${channel} ${level} ${args.join(' ')}`)
    throw Error('Failed to log message - Handler not initialized yet')
  }
  handler(channel, variant.level, stacktrace, ...args)
  if (rc['log-to-console']) {
    if (isMainProcess) {
      const beginning = `${Math.round((Date.now() - startTime) / 100) / 10}s ${
        LoggerVariants[level].symbol
      }${grey(channel)}:`
      if (!stacktrace) {
        /* ignore-console-log */
        console.log(beginning, ...args)
      } else {
        /* ignore-console-log */
        console.log(
          beginning,
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

function getStackTrace(): StackFrame[] | string {
  const rawStack: StackFrame[] = errorStackParser.parse(
    new Error('Get Stacktrace')
  )
  const stack = rawStack.slice(2, rawStack.length)
  return rc['machine-readable-stacktrace']
    ? stack
    : stack.map(s => `\n${s.toString()}`).join()
}

export class Logger {
  //@ts-ignore
  isMainProcess = typeof window === 'undefined'
  constructor(public readonly channel: string) {
    if (channel === 'core/event') {
      // disable js stacktrace for core events
      // as it is useless information (always pointing to the event emitter)
      this.getStackTrace = () => ''
    }
  }

  getStackTrace(): StackFrame[] | string {
    const rawStack: StackFrame[] = errorStackParser.parse(
      new Error('Get Stacktrace')
    )
    const stack = rawStack.slice(2, rawStack.length)
    return rc['machine-readable-stacktrace']
      ? stack
      : stack.map(s => `\n${s.toString()}`).join()
  }

  debug(...args: any[]) {
    if (!rc['log-debug']) return
    log(this, 0, '', args)
  }

  info(...args: any[]) {
    log(this, 1, '', args)
  }

  warn(...args: any[]) {
    log(this, 2, this.getStackTrace(), args)
  }

  error(...args: any[]) {
    log(this, 3, this.getStackTrace(), args)
  }

  critical(...args: any[]) {
    log(this, 4, this.getStackTrace(), args)
  }
}

export function getLogger(channel: string) {
  return new Logger(channel)
}

// Fix for error not being able to be converted into json
// From https://stackoverflow.com/a/18391400
if (!('toJSON' in Error.prototype))
  Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
      const alt = {}
      Object.getOwnPropertyNames(this).forEach(function (key) {
        //@ts-ignore
        alt[key] = this[key]
      }, this)
      return alt
    },
    configurable: true,
    writable: true,
  })
