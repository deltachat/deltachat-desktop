import React from 'react'
import MapComponent from '../map/MapComponent'
import DeltaDialog from '../dialogs/DeltaDialog'

export default function MapDialog (props) {
  const { selectedChat, onClose } = props
  const isOpen = !!selectedChat
  const title = selectedChat ? selectedChat.name + ' (' + selectedChat.subtitle + ')' : 'Map'
  return (
    <DeltaDialog
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      fixed
      style={{ width: 'calc(100vw - 50px)' }}
    >
      <MapComponent selectedChat={selectedChat} />
    </DeltaDialog>
  )
}
