const React = require('react')
const OlMap = require('../OlMap')
const { Dialog } = require('@blueprintjs/core')

class MapLayer extends React.Component {
  constructor (props) {
    super(props)
    console.log(props)
    this.close = this.close.bind(this)
  }

  close () {
    this.props.onClose()
  }

  render () {
    const { points } = this.props
    console.log(points)
    let isOpen = !!points
    const title = 'Karte'
    return (
      <Dialog
        isOpen={isOpen}
        title={title}
        icon='info-sign'
        onClose={this.close}
        canOutsideClickClose={false}>
        <OlMap points={points} />
      </Dialog>
    )
  }
}

module.exports = MapLayer
