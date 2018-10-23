const React = require('react')
const { Classes, Dialog } = require('@blueprintjs/core')

class AboutDialog extends React.Component {
  render () {
    const { isOpen, onClose, info } = this.props
    const tx = window.translate

    const rows = Object.keys(info).map(key => {
      return { key, value: info[key] }
    })

    return (
      <Dialog
        isOpen={isOpen}
        title={tx('aboutDeltaChat')}
        icon='info-sign'
        onClose={onClose}
        canOutsideClickClose={false}>
        <div className={Classes.DIALOG_BODY}>
          {rows.map(row => {
            return <div><div>{row.key}</div><div>{row.value}</div></div>
          })}
        </div>
      </Dialog>
    )
  }
}

module.exports = AboutDialog
