const React = require('react')
const { Classes, Dialog, HTMLTable } = require('@blueprintjs/core')

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
          <HTMLTable bordered='true' condensed='true' striped='true'>
            <thead>
              <tr>
                <th>Setting</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                return <tr>
                  <td>{row.key}</td>
                  <td>{row.value}</td>
                </tr>
              })}
            </tbody>
          </HTMLTable>
        </div>
      </Dialog>
    )
  }
}

module.exports = AboutDialog
