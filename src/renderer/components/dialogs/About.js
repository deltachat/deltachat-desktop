const React = require('react')
const { remote } = require('electron')
const { Classes, Dialog } = require('@blueprintjs/core')
const { APP_VERSION } = require('../../../config')

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

class AboutDialog extends React.Component {
  render () {
    const { isOpen, onClose } = this.props
    const tx = window.translate

    return (
      <Dialog
        isOpen={isOpen}
        title={tx('aboutDeltaChat')}
        icon='info-sign'
        onClose={onClose}
        canOutsideClickClose={false}>
        <div className={Classes.DIALOG_BODY}>
          <p style={{ color: 'grey' }}>{`Version ${APP_VERSION}`}</p>
          <p>Official Delta Chat Desktop app.</p>
          <p>This software is licensed under <ClickableLink href='https://github.com/deltachat/deltachat-desktop/blob/master/LICENSE' text='GNU GPL version 3' />.</p>
          <p>Source code is available on <ClickableLink href='https://github.com/deltachat/deltachat-desktop' text='GitHub' />.</p>
        </div>
      </Dialog>
    )
  }
}

module.exports = AboutDialog
