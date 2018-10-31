const React = require('react')
const { Classes, Dialog } = require('@blueprintjs/core')
const { version } = require('../../../../package.json')

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
          <p style={{ color: 'grey' }}>{'version ' + version}</p>
          <p>Official Delta Chat Desktop app.</p>
          <p>This software is licensed under <a href='https://github.com/deltachat/deltachat-desktop/blob/master/LICENSE'>GNU GPL version 3</a>.</p>
          <p>Source code is available on <a href='https://github.com/deltachat/deltachat-desktop'>GitHub</a>.</p>
        </div>
      </Dialog>
    )
  }
}

module.exports = AboutDialog
