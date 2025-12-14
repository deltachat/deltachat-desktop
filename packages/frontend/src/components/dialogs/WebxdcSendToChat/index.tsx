import React from 'react'
import { C } from '@deltachat/jsonrpc-client'

import { selectedAccountId } from '../../../ScreenController'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { DialogFooter, FooterActionButton, FooterActions } from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import type { DialogProps } from '../../../contexts/DialogContext'
import SelectChat from '../SelectChat'
import useCreateDraftMessage from '../../../hooks/chat/useCreateDraftMesssage'

type Props = {
  messageText: string | null
  file: { file_name: string; file_content: string } | null
} & DialogProps

export default function WebxdcSaveToChatDialog(props: Props) {
  const { onClose, messageText, file } = props

  const tx = useTranslationFunction()
  const accountId = selectedAccountId()
  const createDraftMessage = useCreateDraftMessage()

  const onChatClick = async (chatId: number) => {
    const file2: Parameters<typeof createDraftMessage>[3] = file
      ? {
          path: await runtime.writeTempFileFromBase64(
            file.file_name,
            file.file_content
          ),
          name: file.file_name,
          deleteTempFileWhenDone: true,
          // viewType: undefined
        }
      : undefined
    await createDraftMessage(accountId, chatId, messageText ?? '', file2)
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
                {tx('menu_export_attachment')}
              </FooterActionButton>
            )}
          </FooterActions>
        </DialogFooter>
      }
    />
  )
}
