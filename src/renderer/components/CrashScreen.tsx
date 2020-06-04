import React from 'react'
export class CrashScreen extends React.Component {
  state = {
    hasError: false,
    error: null as any,
  }

  componentDidCatch(error: any) {
    console.log(error)
    this.setState({ hasError: true, error })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='crash-screen'>
          <h1>Ooops something crashed</h1>
          <h2>
            Please restart Deltachat, if this problem persists please notify the
            developers on github issues
            (https://github.com/deltachat/deltachat-desktop/issues)
          </h2>
          <code>{JSON.stringify(this.state.error)}</code>
        </div>
      )
    } else {
      return this.props.children
    }
  }
}
