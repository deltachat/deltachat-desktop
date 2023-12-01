import React, { useState, useEffect } from 'react'

import { DialogProps } from './DialogController'
import { BackendRemote, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import SmallDialog from '../SmallDialog'
import { DialogFooter, FooterActions } from '../Dialog'

type Props = {
  chatListItem: Pick<
    Type.ChatListItemFetchResult & { kind: 'ChatListItem' },
    'id' | 'dmChatContact'
  >
  isOpen: boolean
  onClose: DialogProps['onClose']
}

export default function EncryptionInfo({
  chatListItem,
  isOpen,
  onClose,
}: Props) {
  const [encryptionInfo, setEncryptionInfo] = useState('Fetching...')
  useEffect(() => {
    if (!chatListItem) return
    ;(chatListItem.dmChatContact
      ? BackendRemote.rpc.getContactEncryptionInfo(
          selectedAccountId(),
          chatListItem.dmChatContact
        )
      : BackendRemote.rpc.getChatEncryptionInfo(
          selectedAccountId(),
          chatListItem.id
        )
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
        <DialogFooter>
          <FooterActions>
            <p
              className='delta-button primary bold'
              style={{ float: 'right', userSelect: 'text' }}
              onClick={onClose}
            >
              {tx('ok')}
            </p>
          </FooterActions>
        </DialogFooter>
      </div>
    </SmallDialog>
  )
}
