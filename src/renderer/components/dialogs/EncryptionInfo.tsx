import React, { useState, useEffect } from 'react'
import { DeltaBackend } from '../../delta-remote'
import { DialogProps } from './DialogController'
import {
  SmallDialog,
  DeltaDialogFooter,
  DeltaDialogFooterActions,
} from './DeltaDialog'
import { Type } from '../../backend-com'

export default function EncryptionInfo({
  chatListItem,
  isOpen,
  onClose,
}: {
  chatListItem: Type.ChatListItemFetchResult & { type: 'ChatListItem' }
  isOpen: boolean
  onClose: DialogProps['onClose']
}) {
  const [encryptionInfo, setEncryptionInfo] = useState('Fetching...')
  useEffect(() => {
    if (!chatListItem) return
    ;(chatListItem.dmChatContact
      ? DeltaBackend.call(
          'contacts.getEncryptionInfo',
          chatListItem.dmChatContact
        )
      : DeltaBackend.call('chat.getEncryptionInfo', chatListItem.id)
    ).then(setEncryptionInfo)
  }, [chatListItem])

  const tx = window.static_translate
  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <div className='bp4-dialog-body-with-padding'>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          {!encryptionInfo && 'Fetching...'}
          {encryptionInfo && encryptionInfo}
        </p>
        <DeltaDialogFooter>
          <DeltaDialogFooterActions>
            <p
              className='delta-button primary bold'
              style={{ float: 'right', userSelect: 'text' }}
              onClick={onClose}
            >
              {tx('ok')}
            </p>
          </DeltaDialogFooterActions>
        </DeltaDialogFooter>
      </div>
    </SmallDialog>
  )
}
