const React = require('react')
const MapComponent = require('../map/MapComponent')
const { Dialog } = require('@blueprintjs/core')

class MapDialog extends React.Component {
  constructor (props) {
    super(props)
    this.close = this.close.bind(this)
  }

  close () {
    this.props.onClose()
  }

  render () {
    const { selectedChat, userid } = this.props
    let isOpen = !!selectedChat
    const title = selectedChat ? selectedChat.name + ' ( ' + selectedChat.subtitle + ')' : 'Map'
    return (
      <Dialog
        className='map-dialog'
        isOpen={isOpen}
        title={title}
        icon='info-sign'
        onClose={this.close}
        canOutsideClickClose={false}>
        <MapComponent selectedChat={selectedChat} userid={userid} />
      </Dialog>
    )
  }
}

module.exports = MapDialog
