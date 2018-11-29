const React = require('react')

const { ipcRenderer } = require('electron')

const {
  Intent,
  ProgressBar,
  Classes,
  Dialog
} = require('@blueprintjs/core')

class ImexProgressDialog extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      progress: 0
    }
  }

  componentDidMount () {
    var self = this
    ipcRenderer.on('DC_EVENT_IMEX_PROGRESS', (_event, progress) => {
      self.setState({ progress })
    })
  }

  render () {
    const { progress } = this.state
    const tx = window.translate
    var isOpen = progress > 0 && progress < 1000

    return (
      <Dialog
        isOpen={isOpen}
        title={tx('imexProgressTitle')}
        icon='exchange'
        canEscapeKeyClose={false}
        isCloseButtonShown={false}
        canOutsideClickClose={false}>
        <div className={Classes.DIALOG_BODY}>
          <ProgressBar intent={Intent.PRIMARY} value={isOpen ? (progress / 1000) : null} />
        </div>
      </Dialog>
    )
  }
}
module.exports = ImexProgressDialog
