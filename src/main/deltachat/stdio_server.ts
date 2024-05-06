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
      env: { DC_ACCOUNTS_PATH: this.accounts_path },
    })

    let buffer = ''
    this.server_process.stdout.on('data', data => {
      // console.log(`stdout: ${data}`)
      buffer += data.toString()
      while (true) {
        const pos_end_line = buffer.indexOf('\n')
        if (pos_end_line === 0) {
          buffer = buffer.slice(1)
        }
        if (pos_end_line !== -1 && buffer[pos_end_line - 1] !== '\\') {
          const message = buffer.slice(0, pos_end_line)
          //   console.log(`${pos_end_line} Found message: ${message}`)
          this.on_data(message)
          buffer = buffer.slice(pos_end_line + 1)
        } else {
          break
        }
      }
    })

    this.server_process.stderr.on('data', data => {
      console.log(`stderr: ${data}`)
    })

    this.server_process.on('close', code => {
      console.log(`child process close all stdio with code ${code}`)
    })

    this.server_process.on('exit', code => {
      console.log(`child process exited with code ${code}`)
    })
  }

  send(message: string) {
    this.server_process?.stdin.write(message + '\r\n')
  }
}
