import React, { PropsWithChildren } from 'react'

import { runtime } from '@deltachat-desktop/runtime-interface'
import { getLogger } from '../../../../shared/logger'
import { DialogContext } from '../../contexts/DialogContext'

const log = getLogger('renderer/react-crashhandler')

interface CrashScreenState {
  hasError: boolean
  error: string
}

export class CrashScreen extends React.Component<
  PropsWithChildren<{}>,
  CrashScreenState
> {
  state = {
    hasError: false,
    error: '',
  }

  componentDidCatch(error: object | Error) {
    log.error('The app encountered an react error', error)
    this.setState({
      hasError: true,
      error: this.errorToText(error),
    })
  }

  // FYI we also have `unknownErrorToString`.
  errorToText(error: object | Error) {
    if (error instanceof Error) {
      // TODO parse the stack and map the sourcemap to provide a useful stacktrace
      return (error.stack || '[no stack trace provided]')
        .replace(/file:\/\/\/[\w\W]+?\/html-dist\//g, '') // for development
        .replace(/\(file:\/\/.*?app.asar./g, '(') // for production (packaged)
    } else {
      return JSON.stringify(error)
    }
  }

  render() {
    if (this.state.hasError) {
      const { VERSION, GIT_REF } = runtime.getRuntimeInfo().buildInfo
      return (
        <div className='crash-screen'>
          <h1>Ooops something crashed</h1>
          <h2>
            Please restart Deltachat, if this problem persists please notify the
            developers on github issues (
            <a
              href='#'
              onClick={_ =>
                runtime.openLink(
                  'https://github.com/deltachat/deltachat-desktop/issues'
                )
              }
            >
              github.com/deltachat/deltachat-desktop/issues
            </a>
            )
          </h2>
          <p>
            <button type='button' onClick={_ => runtime.reloadWebContent()}>
              Reload
            </button>
            <button type='button' onClick={_ => runtime.openLogFile()}>
              Open Logfile
            </button>
          </p>
          <p>
            <pre className='error-details'>{this.state.error}</pre>
          </p>
          <p>
            Full Log under{' '}
            <a href='#' onClick={_ => runtime.openLogFile()}>
              {runtime.getCurrentLogLocation()}
            </a>
          </p>
          <p>
            DeltaChat Version: {VERSION} (git: {GIT_REF})
          </p>
        </div>
      )
    } else {
      return this.props.children
    }
  }
}

CrashScreen.contextType = DialogContext
