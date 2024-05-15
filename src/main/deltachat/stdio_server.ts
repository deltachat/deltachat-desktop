import { ChildProcessWithoutNullStreams, spawn } from 'child_process'

export class StdioServer {
  server_process: ChildProcessWithoutNullStreams | null
  constructor(
    public on_data: (reponse: string) => void,
    public accounts_path: string,
    private cmd_path: string
  ) {
    this.server_process = null
  }

  async start() {
    this.server_process = spawn(this.cmd_path, {
      env: {
        DC_ACCOUNTS_PATH: this.accounts_path,
        RUST_LOG: process.env.RUST_LOG,
      },
    })

    let buffer = ''
    this.server_process.stdout.on('data', data => {
      // console.log(`stdout: ${data}`)
      buffer += data.toString()
      while (buffer.includes('\n')) {
        const n = buffer.indexOf('\n')
        const message = buffer.substring(0, n)
        this.on_data(message)
        buffer = buffer.substring(n + 1)
      }
    })

    this.server_process.stderr.on('data', data => {
      console.log(`stderr: ${data}`.trimEnd())
    })

    this.server_process.on('close', (code, signal) => {
      if (code === null) {
        console.log(`child process close all stdio with code ${code}`)
      } else {
        console.log(`child process close all stdio with signal ${signal}`)
      }
    })

    this.server_process.on('exit', (code, signal) => {
      if (code === null) {
        console.log(`child process exited with code ${code}`)
      } else {
        console.log(`child process exited with signal ${signal}`)
      }
    })
  }

  send(message: string) {
    this.server_process?.stdin.write(message + '\n')
  }
}
