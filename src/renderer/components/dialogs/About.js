const React = require('react')
const { remote } = require('electron')
const { Classes, Dialog } = require('@blueprintjs/core')
const {
  appVersion,
  gitHubUrl,
  gitHubLicenseUrl
} = require('../../../application-constants')

const { ipcRenderer } = require('electron')

class ClickableLink extends React.Component {
  onClick () {
    remote.shell.openExternal(this.props.href)
  }

  render () {
    const { href, text } = this.props
    return (
      <a onClick={this.onClick.bind(this)} href={href}>{text}</a>
    )
  }
}

const dcInfoStyle = { overflowX: 'scroll', backgroundColor: 'lightgrey' }

class DCInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      content: undefined
    }
  }

  componentDidMount () {
    this.refresh()
  }

  refresh () {
    this.setState({ loading: true })
    ipcRenderer.send('getDCinfo')
    ipcRenderer.once('dcInfo', (e, info) => {
      this.setState({ loading: false, content: info })
      console.log('dcInfo', info)
      this.forceUpdate()
    })
  }

  render () {
    return (
      <div style={dcInfoStyle}>{JSON.stringify(this.state.content, null, 1)}</div>
    )
  }
}

class About extends React.Component {
  render () {
    const { isOpen, onClose } = this.props
    const tx = window.translate

    return (
      <Dialog
        isOpen={isOpen}
        title={tx('about_deltachat_heading_desktop')}
        icon='info-sign'
        onClose={onClose}
        canOutsideClickClose={false}>
        <div className={Classes.DIALOG_BODY}>
          <p style={{ color: 'grey' }}>{`Version ${appVersion()}`}</p>
          <p>Official Delta Chat Desktop app.</p>
          <p>This software is licensed under <ClickableLink href={gitHubLicenseUrl()} text='GNU GPL version 3' />.</p>
          <p>Source code is available on <ClickableLink href={gitHubUrl()} text='GitHub' />.</p>
          <p>DC Info:</p>
          <DCInfo />
        </div>
      </Dialog>
    )
  }
}

module.exports = About
