import React, { useState, useEffect } from 'react'

import { BackendRemote, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'

type Props = {
  chatListItem: Pick<
    Type.ChatListItemFetchResult & { kind: 'ChatListItem' },
    'id' | 'dmChatContact'
  >
  isOpen: boolean
}

export default function EncryptionInfo({
  chatListItem,
  onClose,
}: Props & DialogProps) {
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

  const tx = useTranslationFunction()

  return (
    <Dialog onClose={onClose}>
      <DialogBody>
        <DialogContent paddingTop>
          <p>
            {!encryptionInfo && 'Fetching...'}
            {encryptionInfo && encryptionInfo}
          </p>
        </DialogContent>
      </DialogBody>
      <DialogFooter>
        <FooterActions>
          <FooterActionButton onClick={onClose}>{tx('ok')}</FooterActionButton>
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}

