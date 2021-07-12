import React, { useState, useEffect } from 'react'
import { DeltaBackend } from '../../delta-remote'
import { ChatListItemType } from '../../../shared/shared-types'
import { DialogProps } from './DialogController'
import {
  SmallDialog,
  DeltaDialogFooter,
  DeltaDialogFooterActions,
} from './DeltaDialog'

export default function EncryptionInfo({
  chatListItem,
  isOpen,
  onClose,
}: {
  chatListItem: ChatListItemType
  isOpen: boolean
  onClose: DialogProps['onClose']
}) {
  const [encryptionInfo, setEncryptionInfo] = useState('Fetching...')
  useEffect(() => {
    if (!chatListItem) return
    ;(!chatListItem.isGroup /*check should rather be isDirectMessage*/
      ? DeltaBackend.call(
          'contacts.getEncryptionInfo',
          chatListItem.contactIds[0]
        )
      : DeltaBackend.call('chat.getEncryptionInfo', chatListItem.id)
    ).then(setEncryptionInfo)
  }, [chatListItem])

  const tx = window.static_translate
  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <div className='bp3-dialog-body-with-padding'>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          {!encryptionInfo && 'Fetching...'}
          {encryptionInfo && encryptionInfo}
        </p>
        <DeltaDialogFooter>
          <DeltaDialogFooterActions>
            <p
              className='delta-button primary bold'
              style={{ float: 'right' }}
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
