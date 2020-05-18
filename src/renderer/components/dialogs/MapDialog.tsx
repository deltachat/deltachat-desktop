import React from 'react'
import MapComponent from '../map/MapComponent'
import DeltaDialog from './DeltaDialog'
import { DialogProps } from './DialogController'
import { FullChat } from '../../../shared/shared-types.d'

export default function MapDialog(props: {
  selectedChat: FullChat
  onClose: DialogProps['onClose']
}) {
  const { selectedChat, onClose } = props
  const isOpen = !!selectedChat
  const title = selectedChat
    ? selectedChat.name + ' (' + selectedChat.subtitle + ')'
    : 'Map'
  return (
    <DeltaDialog
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      canEscapeKeyClose
      fixed
      style={{ width: 'calc(100vw - 50px)' }}
    >
      <MapComponent selectedChat={selectedChat} />
    </DeltaDialog>
  )
}
