const React = require('react')
const { remote } = require('electron')
const { Classes, Dialog } = require('@blueprintjs/core')
const {
  appVersion,
  gitHubUrl,
  gitHubLicenseUrl
} = require('../../../application-constants')

const { ipcRenderer, clipboard } = require('electron')
const log = require('../../../logger').getLogger('renderer/dialogs/About')

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

const dcInfoStyle = { backgroundColor: 'lightgrey', width: '100%' }

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
      log.debug('dcInfo', info)
      this.forceUpdate()
    })
  }

  copy2Clipboard () {
    clipboard.writeText(JSON.stringify(this.state.content, null, 4))
  }

  render () {
    return (
      <div>
        <h3>DC Info:</h3>
        <textarea readOnly style={dcInfoStyle} rows='20' value={JSON.stringify(this.state.content, null, 4)} />
        <button onClick={this.copy2Clipboard.bind(this)}>Copy JSON</button>
      </div>
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
        title={tx('global_menu_help_about_desktop')}
        icon='info-sign'
        onClose={onClose}
        canOutsideClickClose={false}>
        <div className={Classes.DIALOG_BODY}>
          <p style={{ color: 'grey', userSelect: 'all' }}>{`Version ${appVersion()}`}</p>
          <p>Official Delta Chat Desktop app.</p>
          <p>This software is licensed under <ClickableLink href={gitHubLicenseUrl()} text='GNU GPL version 3' />.</p>
          <p>Source code is available on <ClickableLink href={gitHubUrl()} text='GitHub' />.</p>
          <DCInfo />
        </div>
      </Dialog>
    )
  }
}

module.exports = About
