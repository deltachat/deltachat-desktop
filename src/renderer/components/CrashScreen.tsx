import React from 'react'
import { runtime } from '../runtime'
import { VERSION, GIT_REF } from '../../shared/build-info'
export class CrashScreen extends React.Component {
  state = {
    hasError: false,
    error: '',
  }

  componentDidCatch(error: any) {
    this.setState({
      hasError: true,
      error: this.errorToText(error),
    })
  }

  errorToText(error: any) {
    if (error instanceof Error) {
      // TODO parse the stack and map the sourcemap to provide a usefull stacktrace
      return error.stack.replace(/file:\/\/\/[\w\W]+?\/html-dist\//g, '')
    } else {
      return JSON.stringify(error)
    }
  }

  render() {
    if (this.state.hasError) {
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
