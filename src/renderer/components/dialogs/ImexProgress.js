const React = require('react')
const {
  Intent,
  ProgressBar,
  Classes,
  Dialog
} = require('@blueprintjs/core')

class ImexProgress extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      progress: 0
    }
  }

  render () {
    const { progress } = this.state
    const tx = window.translate
    var isOpen = progress > 0 && progress < 1000

    return (
      <Dialog
        isOpen={isOpen}
        title={tx('imex_progress_title_desktop')}
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
module.exports = ImexProgress
