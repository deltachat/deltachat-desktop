const React = require('react')
const { remote } = require('electron')
const { Classes, Dialog } = require('@blueprintjs/core')
const {
  appVersion,
  gitHubUrl,
  gitHubLicenseUrl
} = require('../../../application-constants')
const Unselectable = require('../helpers/Unselectable')

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
          <Unselectable>
            <p style={{ color: 'grey' }}>{`Version ${appVersion()}`}</p>
            <p>Official Delta Chat Desktop app.</p>
            <p>This software is licensed under <ClickableLink href={gitHubLicenseUrl()} text='GNU GPL version 3' />.</p>
            <p>Source code is available on <ClickableLink href={gitHubUrl()} text='GitHub' />.</p>
          </Unselectable>
        </div>
      </Dialog>
    )
  }
}

module.exports = About
