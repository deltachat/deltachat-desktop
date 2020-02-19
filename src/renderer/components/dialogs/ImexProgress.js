import React from 'react'
const { ipcRenderer } = window.electron_functions
import {
  Intent,
  ProgressBar,
  Classes
} from '@blueprintjs/core'
import DeltaDialog from './DeltaDialog'

export default class ImexProgress extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      progress: 0
    }

    this.onDcEventImexProgress = this.onDcEventImexProgress.bind(this)
  }

  onDcEventImexProgress (_event, progress) {
    this.setState({ progress })
  }

  componentDidMount () {
    ipcRenderer.on('DC_EVENT_IMEX_PROGRESS', this.onDcEventImexProgress)
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('DC_EVENT_IMEX_PROGRESS', this.onDcEventImexProgress)
  }

  render () {
    const { progress } = this.state
    const tx = window.translate
    var isOpen = progress > 0 && progress < 1000

    return (
      <DeltaDialog
        isOpen={isOpen}
        title={tx('imex_progress_title_desktop')}
        canEscapeKeyClose={false}
        isCloseButtonShown={false}
        canOutsideClickClose={false}>
        <div className={Classes.DIALOG_BODY}>
          <ProgressBar intent={Intent.PRIMARY} value={isOpen ? (progress / 1000) : null} />
        </div>
      </DeltaDialog>
    )
  }
}
