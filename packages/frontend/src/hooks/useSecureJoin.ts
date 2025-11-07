import { useCallback } from 'react'

import useConfirmationDialog from './dialog/useConfirmationDialog'
import useTranslationFunction from './useTranslationFunction'
import { BackendRemote } from '../backend-com'

import type { T } from '@deltachat/jsonrpc-client'
import type {
  JoinBroadcastQr,
  QrWithUrl,
  VerifyContactQr,
  VerifyGroupQr,
} from '../backend/qr'
import type { TranslationKey } from '@deltachat-desktop/shared/translationKeyType'

type QrKind = 'askVerifyContact' | 'askVerifyGroup' | 'askJoinBroadcast'

interface JoinConfig {
  kind: QrKind
  getConfirmMessage: (qr: any, accountId?: number) => string | Promise<string>
  dataTestid: string
  txKey: TranslationKey
}

const JOIN_CONFIGS: Record<QrKind, JoinConfig> = {
  askVerifyContact: {
    kind: 'askVerifyContact',
    getConfirmMessage: async (qr, accountId) => {
      const contact = await BackendRemote.rpc.getContact(
        accountId!,
        qr.contact_id
      )
      return contact.displayName
    },
    dataTestid: 'confirm-start-chat',
    txKey: 'ask_start_chat_with',
  },
  askVerifyGroup: {
    kind: 'askVerifyGroup',
    getConfirmMessage: qr => qr.grpname,
    dataTestid: 'confirm-join-group',
    txKey: 'qrscan_ask_join_group',
  },
  askJoinBroadcast: {
    kind: 'askJoinBroadcast',
    getConfirmMessage: qr => qr.name,
    dataTestid: 'confirm-join-channel',
    txKey: 'qrscan_ask_join_channel',
  },
}

export default function useSecureJoin() {
  const openConfirmationDialog = useConfirmationDialog()
  const tx = useTranslationFunction()

  /**
   * Performs a secure join operation for contacts, groups, or channels
   * based on the QR code type.
   */
  const secureJoin = useCallback(
    async (
      accountId: number,
      qrWithUrl: QrWithUrl<VerifyContactQr | VerifyGroupQr | JoinBroadcastQr>,
      skipUserConfirmation: boolean = false
    ): Promise<T.FullChat['id'] | null> => {
      const { qr, url } = qrWithUrl

      const config = JOIN_CONFIGS[qr.kind]

      // Get user confirmation unless skipped
      const userConfirmed =
        skipUserConfirmation ||
        (await (async () => {
          const messageParam = await config.getConfirmMessage(qr, accountId)
          return await openConfirmationDialog({
            message: tx(config.txKey, messageParam),
            confirmLabel: tx('ok'),
            dataTestid: config.dataTestid,
          })
        })())

      if (userConfirmed) {
        return await BackendRemote.rpc.secureJoin(accountId, url)
      }

      return null
    },
    [openConfirmationDialog, tx]
  )

  return {
    secureJoin,
  }
}
