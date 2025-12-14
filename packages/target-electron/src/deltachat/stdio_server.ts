import { getLogger } from '@deltachat-desktop/shared/logger'
import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import { app, dialog } from 'electron/main'
import { BuildInfo } from '../get-build-info'
import { arch, platform } from 'os'
import { getLogsPath } from '../application-constants'

const log = getLogger('DC-RPC')

export class StdioServer {
  serverProcess: ChildProcessWithoutNullStreams | null
  constructor(
    public on_data: (reponse: string) => void,
    public accounts_path: string,
    private cmd_path: string
  ) {
    this.serverProcess = null
  }

  start() {
    this.serverProcess = spawn(this.cmd_path, {
      env: {
        DC_ACCOUNTS_PATH: this.accounts_path,
        RUST_LOG: process.env.RUST_LOG,
        // remove color from errors, see https://github.com/deltachat/deltachat-desktop/issues/4832
        NO_COLOR: '1',
      },
    })

    this.serverProcess.on('error', err => {
      // The 'error' event is emitted whenever:
      // - The process could not be spawned.
      // - The process could not be killed.
      // - Sending a message to the child process failed.
      // - The child process was aborted via the signal option.
      // ~ https://nodejs.org/api/child_process.html#event-error

      if (err.message.endsWith('ENOENT')) {
        dialog.showErrorBox(
          'Fatal Error: Core Library Missing',
          `The DeltaChat Module is missing! This could be due to your antivirus program. Please check the quarantine to restore it and notify the developers about this issue.
You can reach us on delta@merlinux.eu or on github.com/deltachat/deltachat-desktop/issues.

The missing module should be located at "${this.cmd_path}".

The Log file is located in this folder: ${getLogsPath()}
--------------------
Error: ${err.message}
`
        )
      } else {
        dialog.showErrorBox(
          'Fatal Error',
          `Error with core has been detected, please contact developers: You can reach us on delta@merlinux.eu or on github.com/deltachat/deltachat-desktop/issues .

          ${err.name}: ${err.message}

          The Log file is located in this folder: ${getLogsPath()}\n
          `
        )
      }
      // I think we can exit in all the cases, because all errors here are serious
      app.exit(1)
    })

    let buffer = ''
    this.serverProcess.stdout.on('data', data => {
      // console.log(`stdout: ${data}`)
      buffer += data.toString()
      while (buffer.includes('\n')) {
        const n = buffer.indexOf('\n')
        const message = buffer.substring(0, n)
        this.on_data(message)
        buffer = buffer.substring(n + 1)
      }
    })

    // some kind of "buffer" that the text in the error dialog does not get too long
    let errorLog = ''
    const ERROR_LOG_LENGTH = 800
    this.serverProcess.stderr.on('data', data => {
      log.error(`stderr: ${data}`.trimEnd())
      errorLog = (errorLog + data).slice(-ERROR_LOG_LENGTH)
    })

    this.serverProcess.on('close', (code, signal) => {
      if (code !== null) {
        log.info(`child process close all stdio with code ${code}`)
      } else {
        log.info(`child process close all stdio with signal ${signal}`)
      }
    })

    this.serverProcess.on('exit', (code, signal) => {
      if (code !== null) {
        log.info(`child process exited with code ${code}`)
        if (code !== 0) {
          log.critical('Fatal: The Delta Chat Core exited unexpectedly', code)
          dialog.showErrorBox(
            'Fatal Error',
            `[Version: ${
              BuildInfo.VERSION
            } | ${platform()} | ${arch()}]\nThe Delta Chat Core exited unexpectedly with code ${code}\n${errorLog}`
          )
          app.exit(1)
        }
      } else {
        log.warn(`child process exited with signal ${signal}`)
      }
    })
  }

  send(message: string) {
    this.serverProcess?.stdin.write(message + '\n')
  }
}
