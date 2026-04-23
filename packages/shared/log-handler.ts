import { createWriteStream } from 'fs'
import { join } from 'path'
import { readdir, lstat, unlink } from 'fs/promises'
import { stdout, stderr } from 'process'
import { getLogger, LogHandlerFunction } from './logger.js'

stdout.on('error', () => {})
stderr.on('error', () => {})
// ^ Without this, the app will run into infinite exceptions
// when it can't write to stdout or stderr

function generateLogFileName(logsDir: string) {
  const d = new Date()
  function pad(number: number) {
    return number < 10 ? '0' + number : number
  }
  const fileName = [
    `${d.getFullYear()}-`,
    `${pad(d.getMonth() + 1)}-`,
    `${pad(d.getDate())}-`,
    `${pad(d.getHours())}-`,
    `${pad(d.getMinutes())}-`,
    `${pad(d.getSeconds())}`,
    '.log',
  ].join('')
  return join(logsDir, fileName)
}

type CreateLogHandlerOptions = {
  onWriteError?: (err: Error, logFilePath: string) => void
}

export function createLogHandler(
  logsDir: string,
  options: CreateLogHandlerOptions = {}
) {
  const fileName = generateLogFileName(logsDir)
  const stream = createWriteStream(fileName, { flags: 'w' })
  let writeErrorReported = false
  stream.on('error', err => {
    if (!writeErrorReported) {
      writeErrorReported = true
      options.onWriteError?.(err, fileName)
    }
    // eslint-disable-next-line no-console
    console.error('Log file write error:', err.message)
  })
  // eslint-disable-next-line no-console
  console.log(`Logfile: ${fileName}`)
  return {
    /**
     * Internal log handler. Do not call directly!
     * @param channel The part/module where the message was logged from, e.g. 'main/deltachat'
     * @param level DEBUG, INFO, WARNING, ERROR or CRITICAL
     * @param stacktrace Stack trace if WARNING, ERROR or CRITICAL
     * @param ...args Variadic parameters. Stringified before logged to file
     */
    log: ((
      channel: string,
      level: string,
      stacktrace: any[],
      ...args: any[]
    ) => {
      const timestamp = new Date().toISOString()
      let line = [timestamp, fillString(channel, 22), level]
      line = line.concat(
        [stacktrace, ...args].map(value => {
          try {
            return JSON.stringify(value)
          } catch {
            return '[unserializable]'
          }
        })
      )
      if (stream.writable) {
        stream.write(`${line.join('\t')}\n`)
      } else {
        // eslint-disable-next-line no-console
        console.warn('tried to log something after logger shut down', {
          channel,
          level,
          args,
          stacktrace,
        })
      }
    }) as LogHandlerFunction,
    end: () => stream.end(),
    logFilePath: () => fileName,
  }
}
export type LogHandler = ReturnType<typeof createLogHandler>

export async function cleanupLogFolder(logsDir: string) {
  const log = getLogger('logger/log-cleanup')

  const logDirContent = await readdir(logsDir)
  const filesWithDates = await Promise.all(
    logDirContent.map(async logFileName => ({
      filename: logFileName,
      mtime: (await lstat(join(logsDir, logFileName))).mtime.getTime(),
    }))
  )

  const sortedFiles = filesWithDates.sort((a, b) => a.mtime - b.mtime)

  if (sortedFiles.length > 10) {
    // remove latest 10 logs from list
    sortedFiles.splice(sortedFiles.length - 11)

    const fileCount = await Promise.all(
      sortedFiles.map(({ filename }) => unlink(join(logsDir, filename)))
    )

    log.info(`Successfuly deleted ${fileCount.length} old logfiles`)
  } else {
    log.debug('Nothing to do (not more than 10 logfiles to delete)')
  }
}

function fillString(string: string, n: number) {
  if (string.length < n) {
    return string + ' '.repeat(n - string.length)
  }
  return string
}
