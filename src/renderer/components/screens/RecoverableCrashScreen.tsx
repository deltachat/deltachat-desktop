import React from 'react'
import { runtime } from '../../runtime'
import { VERSION, GIT_REF } from '../../../shared/build-info'
import { getLogger } from '../../../shared/logger'
const log = getLogger('renderer/react-crashhandler')

/**
 * if props.reset_on_change_key changes the RecoverableCrashScreen is reset
 */
export class RecoverableCrashScreen extends React.Component<{
  reset_on_change_key: string | number
}> {
  state = {
    hasError: false,
    error: '',
    old_error_reset_key: undefined,
    timestamp: 0,
  }

  componentDidCatch(error: any) {
    log.error('The app encountered an react error', error)
    this.setState({
      hasError: true,
      error: this.errorToText(error),
      old_error_reset_key: this.props.reset_on_change_key,
      timestamp: Date.now(),
    })
  }

  errorToText(error: any) {
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
    if (
      this.state.old_error_reset_key &&
      this.state.old_error_reset_key !== this.props.reset_on_change_key
    ) {
      this.setState({
        hasError: false,
        error: '',
        old_error_reset_key: undefined,
        timestamp: 0,
      })
    }
    if (
      this.state.hasError &&
      this.state.old_error_reset_key === this.props.reset_on_change_key
    ) {
      return (
        <div className='crash-screen'>
          {this.props.reset_on_change_key}:{this.state.timestamp}
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
            <button onClick={_ => runtime.reloadWebContent()}>Reload</button>
            <button onClick={_ => runtime.openLogFile()}>Open Logfile</button>
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
