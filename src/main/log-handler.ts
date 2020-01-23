import { createWriteStream } from 'fs'
import { join } from 'path'
import { getLogsPath } from './application-constants'

function logName() {
  const dir = getLogsPath()
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
    '.log.tsv'
  ].join('')
  return join(dir, fileName)
}

export function createLogHandler() {
  const fileName = logName()
  const stream = createWriteStream(fileName, { flags: 'w' })
  /* ignore-console-log */
  console.log(`Logfile: ${fileName}`)
  return {
    /**
     * Internal log handler. Do not call directly!
     * @param channel The part/module where the message was logged from, e.g. 'main/deltachat'
     * @param level DEBUG, INFO, WARNING, ERROR or CRITICAL
     * @param stacktrace Stack trace if WARNING, ERROR or CRITICAL
     * @param ...args Variadic parameters. Stringified before logged to file
     */
    log: (channel: string, level: string, stacktrace: any[], ...args: any[]) => {
      const timestamp = new Date().toISOString()
      let line = [timestamp, channel, level]
      line = line
        .concat([stacktrace, ...args])
        .map(value => JSON.stringify(value))
      stream.write(`${line.join('\t')}\n`)
    },
    end: () => stream.end(),
    logFilePath: () => fileName
  }
}

import { readdir, lstat, unlink } from 'fs-extra'
import { getLogger } from '../shared/logger'

export async function cleanupLogFolder() {
  const log = getLogger('logger/log-cleanup')
  const logDir = getLogsPath()

  const logDirContent = await readdir(logDir)
  const filesWithDates = (await Promise.all(
    logDirContent.map(
      async (logFileName) => ({
        filename: logFileName,
        mtime: (await lstat(join(logDir, logFileName))).mtime.getTime(),
      })
    )
  ))

  let sortedFiles = filesWithDates.sort((a, b) => a.mtime - b.mtime)

  if (sortedFiles.length > 10) {
    // remove latest 10 logs from list
    sortedFiles.splice(sortedFiles.length - 11)

    const fileCount = await Promise.all(
      sortedFiles.map(
        ({ filename }) => unlink(join(logDir, filename))
      )
    )

    log.info(`Successfuly deleted ${fileCount.length} old logfiles`)
  } else {
    log.debug('Nothing to do (not more than 10 logfiles to delete)')
  }
}