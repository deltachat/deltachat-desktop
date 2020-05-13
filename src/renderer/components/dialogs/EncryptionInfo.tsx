import React, { useState, useEffect } from 'react'
import { Classes } from '@blueprintjs/core'
import SmallDialog, { DeltaButton } from './SmallDialog'
import { DeltaBackend } from '../../delta-remote'
import { FullChat, ChatListItemType } from '../../../shared/shared-types'
import { DialogProps } from '.'

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
    DeltaBackend.call(
      'chat.getEncryptionInfo',
      chatListItem.contactIds[0]
    ).then(setEncryptionInfo)
  })

  const tx = window.translate
  return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <div className='bp3-dialog-body-with-padding'>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          {!encryptionInfo && 'Fetching...'}
          {encryptionInfo && encryptionInfo}
        </p>
        <div className={Classes.DIALOG_FOOTER}>
          <div
            className={Classes.DIALOG_FOOTER_ACTIONS}
            style={{ marginTop: '7px' }}
          >
            <DeltaButton style={{ float: 'right' }} onClick={onClose}>
              {tx('ok')}
            </DeltaButton>
          </div>
        </div>
      </div>
    </SmallDialog>
  )
}
