import React from 'react'
import MapComponent from '../map/MapComponent'
import DeltaDialog from '../dialogs/DeltaDialog'

export default function MapDialog(props) {
  const { selectedChat, onClose } = props
  const isOpen = !!selectedChat
  const title = selectedChat ? selectedChat.name + ' (' + selectedChat.subtitle + ')' : 'Map'
  return (
    <DeltaDialog
      className='map-dialog'
      isOpen={isOpen}
      title={title}
      onClose={onClose}
    >
      <MapComponent selectedChat={selectedChat} />
    </DeltaDialog>
  )
}
