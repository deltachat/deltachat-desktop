import { useCallback } from 'react'

import useConfirmationDialog from './dialog/useConfirmationDialog'
import useTranslationFunction from './useTranslationFunction'
import { BackendRemote } from '../backend-com'

import type { T } from '@deltachat/jsonrpc-client'
import type { QrWithUrl, VerifyContactQr, VerifyGroupQr } from '../backend/qr'

export default function useSecureJoin() {
  const openConfirmationDialog = useConfirmationDialog()
  const tx = useTranslationFunction()

  const confirmJoinContact = useCallback(
    async (
      accountId: number,
      qrWithUrl: QrWithUrl<VerifyContactQr>
    ): Promise<boolean> => {
      const { qr } = qrWithUrl
      if (qr.kind !== 'askVerifyContact') {
        throw new Error(
          "secureJoinContact requires QR codes of kind 'askVerifyContact'"
        )
      }

      const contact = await BackendRemote.rpc.getContact(
        accountId,
        qr.contact_id
      )

      return await openConfirmationDialog({
        message: tx('ask_start_chat_with', contact.displayName),
        confirmLabel: tx('ok'),
        dataTestid: 'confirm-start-chat',
      })
    },
    [openConfirmationDialog, tx]
  )

  const confirmJoinGroup = useCallback(
    async (qrWithUrl: QrWithUrl) => {
      const { qr } = qrWithUrl
      if (qr.kind !== 'askVerifyGroup') {
        throw new Error(
          "secureJoinGroup requires QR codes of kind 'askVerifyGroup'"
        )
      }

      return await openConfirmationDialog({
        message: tx('qrscan_ask_join_group', qr.grpname),
        confirmLabel: tx('ok'),
        dataTestid: 'confirm-join-group',
      })
    },
    [openConfirmationDialog, tx]
  )

  /**
   * called after scanning a contact invite link
   */
  const secureJoinContact = useCallback(
    async (
      accountId: number,
      qrWithUrl: QrWithUrl<VerifyContactQr>,
      skipUserConfirmation: boolean = false
    ): Promise<T.FullChat['id'] | null> => {
      const { qr, url } = qrWithUrl
      if (qr.kind !== 'askVerifyContact') {
        throw new Error(
          "secureJoinContact requires QR codes of kind 'askVerifyContact'"
        )
      }

      const userConfirmed = skipUserConfirmation
        ? true
        : await confirmJoinContact(accountId, qrWithUrl)

      if (userConfirmed) {
        return await BackendRemote.rpc.secureJoin(accountId, url)
      }

      return null
    },
    [confirmJoinContact]
  )

  const secureJoinGroup = useCallback(
    async (
      accountId: number,
      qrWithUrl: QrWithUrl<VerifyGroupQr>,
      skipUserConfirmation: boolean = false
    ): Promise<T.FullChat['id'] | null> => {
      const { qr, url } = qrWithUrl
      if (qr.kind !== 'askVerifyGroup') {
        throw new Error(
          "secureJoinGroup requires QR codes of kind 'askVerifyGroup'"
        )
      }

      const userConfirmed = skipUserConfirmation
        ? true
        : await confirmJoinGroup(qrWithUrl)

      if (userConfirmed) {
        return await BackendRemote.rpc.secureJoin(accountId, url)
      }

      return null
    },
    [confirmJoinGroup]
  )

  return {
    secureJoinGroup,
    secureJoinContact,
  }
}
