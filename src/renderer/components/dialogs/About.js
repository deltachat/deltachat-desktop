const React = require('react')
const { Classes, Dialog, Collapse, Button } = require('@blueprintjs/core')
const { version } = require('../../../../package.json')

class AboutDialog extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showAdvanced: false
    }

    this.handleShowAdvanced = this.handleShowAdvanced.bind(this)
  }

  handleShowAdvanced () {
    this.setState({ showAdvanced: !this.state.showAdvanced })
  }

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
          <p style={{color: 'grey'}}>{'version ' + version}</p>
          <p>Official Delta.Chat Desktop app.</p>
          <p>This software is licensed under <a href="https://github.com/deltachat/deltachat-desktop/blob/master/LICENSE">GNU GPL version 3</a>.</p>
          <p>Source code is available on <a href="https://github.com/deltachat/deltachat-desktop">GitHub</a>.</p>
          <Button onClick={this.handleShowAdvanced}>{(this.state.showAdvanced ? '-' : '+') + ' ' + tx('login.advanced') }</Button>
          <Collapse isOpen={this.state.showAdvanced}>
            <ul>
              {rows.map(row => {
                return <li>{row.key + ': ' + row.value}</li>
              })}
            </ul>

          </Collapse>
        </div>
      </Dialog>
    )
  }
}

module.exports = AboutDialog
