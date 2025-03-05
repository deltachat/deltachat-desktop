import React, { useCallback } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import { BackendRemote } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { DialogFooter, FooterActionButton, FooterActions } from '../../Dialog'
import ConfirmationDialog from '../ConfirmationDialog'
import useChat from '../../../hooks/chat/useChat'
import useDialog from '../../../hooks/dialog/useDialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import type { DialogProps } from '../../../contexts/DialogContext'
import SelectChat from '../SelectChat'
import { basename } from 'path'

type Props = {
  messageText: string | null
  file: { file_name: string; file_content: string } | null
} & DialogProps

export default function WebxdcSaveToChatDialog(props: Props) {
  const { onClose, messageText, file } = props

  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const sendToChatAction = useSendToChatAction()

  const onChatClick = async (chatId: number) => {
    let path = null
    if (file) {
      path = await runtime.writeTempFileFromBase64(
        file.file_name,
        file.file_content
      )
    }
    await sendToChatAction(accountId, chatId, messageText, path)
    if (path) {
      await runtime.removeTempFile(path)
    }
    onClose()
  }

  const onSaveClick = async () => {
    if (file) {
      const tmp_file = await runtime.writeTempFileFromBase64(
        file.file_name,
        file.file_content
      )
      onClose()
      await runtime.downloadFile(tmp_file, file.file_name)
      await runtime.removeTempFile(tmp_file)
    }
  }

  const title = file
    ? tx('send_file_to', file.file_name)
    : tx('send_message_to')

  return (
    <SelectChat
      headerTitle={title}
      onChatClick={onChatClick}
      onClose={onClose}
      listFlags={C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS}
      footer={
        <DialogFooter>
          <FooterActions align='start'>
            {file && (
              <FooterActionButton onClick={onSaveClick}>
                {tx('save_as')}
              </FooterActionButton>
            )}
          </FooterActions>
        </DialogFooter>
      }
    />
  )
}

function useSendToChatAction() {
  const { openDialog } = useDialog()
  const { selectChat } = useChat()
  const tx = useTranslationFunction()

  return useCallback(
    async (
      accountId: number,
      chatId: number,
      messageText: string | null,
      file: string | null
    ) => {
      const chatP = BackendRemote.rpc.getBasicChatInfo(accountId, chatId)
      const draft = await BackendRemote.rpc.getDraft(accountId, chatId)

      selectChat(accountId, chatId)

      if (draft) {
        // ask if the draft should be replaced
        const chat = await chatP
        const continueProcess = await new Promise((resolve, _reject) => {
          openDialog(ConfirmationDialog, {
            message: tx('confirm_replace_draft', chat.name),
            confirmLabel: tx('replace_draft'),
            cb: resolve,
          })
        })
        if (!continueProcess) {
          return
        }
      }
      const fileName = file ? basename(file) : null
      await BackendRemote.rpc.miscSetDraft(
        accountId,
        chatId,
        messageText,
        file,
        fileName,
        null,
        file ? 'File' : 'Text'
      )

      window.__reloadDraft && window.__reloadDraft()
    },
    [tx, openDialog, selectChat]
  )
}
