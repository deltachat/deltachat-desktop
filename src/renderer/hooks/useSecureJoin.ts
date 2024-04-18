import { useCallback } from 'react'

import useConfirmationDialog from './dialog/useConfirmationDialog'
import useTranslationFunction from './useTranslationFunction'
import { BackendRemote } from '../backend-com'

import type { QrWithUrl } from './useProcessQr'
import type { FullChat } from '@deltachat/jsonrpc-client/dist/generated/types'

export default function useSecureJoin() {
  const openConfirmationDialog = useConfirmationDialog()
  const tx = useTranslationFunction()

  const secureJoinContact = useCallback(
    async (
      accountId: number,
      qrWithUrl: QrWithUrl
    ): Promise<FullChat['id'] | null> => {
      const { qr, url } = qrWithUrl
      if (qr.kind !== 'askVerifyContact') {
        throw new Error(
          "secureJoinContact requires QR codes of kind 'askVerifyContact'"
        )
      }

      const contact = await BackendRemote.rpc.getContact(
        accountId,
        qr.contact_id
      )

      const userConfirmed = await openConfirmationDialog({
        message: tx('ask_start_chat_with', contact.address),
        confirmLabel: tx('ok'),
      })

      if (userConfirmed) {
        return await BackendRemote.rpc.secureJoin(accountId, url)
      }

      return null
    },
    [openConfirmationDialog, tx]
  )

  const secureJoinGroup = useCallback(
    async (
      accountId: number,
      qrWithUrl: QrWithUrl
    ): Promise<FullChat['id'] | null> => {
      const { qr, url } = qrWithUrl
      if (qr.kind !== 'askVerifyGroup') {
        throw new Error(
          "secureJoinGroup requires QR codes of kind 'askVerifyGroup'"
        )
      }

      const userConfirmed = await openConfirmationDialog({
        message: tx('qrscan_ask_join_group', qr.grpname),
        confirmLabel: tx('ok'),
      })

      if (userConfirmed) {
        return await BackendRemote.rpc.secureJoin(accountId, url)
      }

      return null
    },
    [openConfirmationDialog, tx]
  )

  return {
    secureJoinGroup,
    secureJoinContact,
  }
}
