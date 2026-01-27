import React from 'react'

import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import Dialog, { DialogBody, DialogContent, DialogHeader } from '../Dialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'

import type { DialogProps } from '../../contexts/DialogContext'
import { useRpcFetch } from '../../hooks/useFetch'
import { unknownErrorToString } from '../helpers/unknownErrorToString'

export type Props =
  | {
      chatId: number
      dmChatContact: number | null
    }
  | {
      chatId: number | null
      dmChatContact: number
    }

export function EncryptionInfo({
  chatId,
  dmChatContact,
  onClose,
}: Props & DialogProps) {
  const tx = useTranslationFunction()

  const contactInfoFetch = useRpcFetch(
    BackendRemote.rpc.getContactEncryptionInfo,
    dmChatContact != null ? [selectedAccountId(), dmChatContact] : null
  )
  const chatInfoFetch = useRpcFetch(
    BackendRemote.rpc.getChatEncryptionInfo,
    chatId != null ? [selectedAccountId(), chatId] : null
  )
  const infoFetch = contactInfoFetch ?? chatInfoFetch
  if (infoFetch == null) {
    return <>{tx('error_x', 'chat or contact ID not provided')}</>
  }

  return (
    <Dialog onClose={onClose}>
      <DialogHeader
        title={tx('encryption_info_title_desktop')}
        onClose={onClose}
      />
      <DialogBody>
        <DialogContent>
          <p style={{ whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
            {infoFetch.loading
              ? tx('loading')
              : infoFetch.result.ok === false
                ? tx(
                    'error_x',
                    'Failed to load encryption info:\n' +
                      unknownErrorToString(infoFetch.result.err)
                  )
                : infoFetch.result.value}
          </p>
        </DialogContent>
      </DialogBody>
    </Dialog>
  )
}
