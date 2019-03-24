const React = require('react')
const Map = require('../Map')
const { Dialog } = require('@blueprintjs/core')

class MapDialog extends React.Component {
  constructor (props) {
    super(props)
    console.log(props)
    this.close = this.close.bind(this)
  }

  close () {
    this.props.onClose()
  }

  render () {
    const { selectedChat } = this.props
    let isOpen = !!selectedChat
    const title = 'Karte'
    return (
      <Dialog
        className='map-dialog'
        isOpen={isOpen}
        title={title}
        icon='info-sign'
        onClose={this.close}
        canOutsideClickClose={false}>
        <Map selectedChat={selectedChat} />
      </Dialog>
    )
  }
}

module.exports = MapDialog
