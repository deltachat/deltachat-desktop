import React from 'react'
import { C } from '@deltachat/jsonrpc-client'
import AutoSizer from 'react-virtualized-auto-sizer'

import ChatListItem from '../chat/ChatListItem'
import { PseudoListItemNoSearchResults } from '../helpers/PseudoListItem'
import { ChatListPart, useLogicVirtualChatList } from '../chat/ChatList'
import { useChatList } from '../chat/ChatListHelpers'
import { useThemeCssVar } from '../../ThemeManager'
import { selectChat } from '../helpers/ChatMethods'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { runtime } from '../../runtime'
import Dialog, {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  FooterActionButton,
  FooterActions,
} from '../Dialog'
import ConfirmationDialog from './ConfirmationDialog'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import useDialog from '../../hooks/useDialog'

import type { DialogProps, OpenDialog } from '../../contexts/DialogContext'

const LIST_FLAGS = C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS

export default function WebxdcSaveToChatDialog(
  props: {
    messageText: string | null
    file: { file_name: string; file_content: string } | null
  } & DialogProps
) {
  const { onClose, messageText, file } = props

  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const { chatListIds, queryStr, setQueryStr } = useChatList(LIST_FLAGS)
  const { isChatLoaded, loadChats, chatCache } = useLogicVirtualChatList(
    chatListIds,
    LIST_FLAGS
  )

  const onChatClick = async (chatId: number) => {
    let path = null
    if (file) {
      path = await runtime.writeTempFileFromBase64(
        file.file_name,
        file.file_content
      )
    }
    await sendToChatAction(openDialog, chatId, messageText, path)
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

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQueryStr(e.target.value)

  const CHATLISTITEM_CHAT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-chat-height')) || 64

  const title = file
    ? tx('send_file_to', file.file_name)
    : tx('send_message_to')

  const noResults = chatListIds.length === 0 && queryStr !== ''
  return (
    <Dialog onClose={onClose} fixed>
      <DialogHeader onClose={onClose} title={title} />
      <DialogBody>
        <div className='webxdc-send-to-chat-dialog'>
          <DialogContent>
            <div className='select-chat-chat-list'>
              <input
                className='search-input'
                onChange={onSearchChange}
                value={queryStr}
                placeholder={tx('contacts_enter_name_or_email')}
                autoFocus
                spellCheck={false}
              />
              {noResults && queryStr && (
                <PseudoListItemNoSearchResults queryStr={queryStr} />
              )}
              <div
                style={noResults ? { height: '0px' } : {}}
                className='results'
              >
                <AutoSizer>
                  {({ width, height }) => (
                    <ChatListPart
                      isRowLoaded={isChatLoaded}
                      loadMoreRows={loadChats}
                      rowCount={chatListIds.length}
                      width={width}
                      height={height}
                      itemKey={index => 'key' + chatListIds[index]}
                      itemHeight={CHATLISTITEM_CHAT_HEIGHT}
                    >
                      {({ index, style }) => {
                        const chatId = chatListIds[index]
                        return (
                          <div style={style}>
                            <ChatListItem
                              chatListItem={chatCache[chatId] || undefined}
                              onClick={onChatClick.bind(null, chatId)}
                            />
                          </div>
                        )
                      }}
                    </ChatListPart>
                  )}
                </AutoSizer>
              </div>
            </div>
          </DialogContent>
        </div>
      </DialogBody>
      <DialogFooter>
        <FooterActions align='start'>
          {file && (
            <FooterActionButton onClick={onSaveClick}>
              {tx('save_as')}
            </FooterActionButton>
          )}
        </FooterActions>
      </DialogFooter>
    </Dialog>
  )
}

async function sendToChatAction(
  openDialog: OpenDialog,
  chatId: number,
  messageText: string | null,
  file: string | null
) {
  const accountId = selectedAccountId()

  const chat = await BackendRemote.rpc.getBasicChatInfo(accountId, chatId)
  const draft = await BackendRemote.rpc.getDraft(accountId, chatId)

  selectChat(chatId)

  if (draft) {
    // ask if the draft should be replaced
    const continue_process = await new Promise((resolve, _reject) => {
      openDialog(ConfirmationDialog, {
        message: window.static_translate('confirm_replace_draft', chat.name),
        confirmLabel: window.static_translate('replace_draft'),
        cb: resolve,
      })
    })
    if (!continue_process) {
      return
    }
  }

  await BackendRemote.rpc.miscSetDraft(
    accountId,
    chatId,
    messageText,
    file,
    null,
    file ? 'File' : 'Text'
  )

  window.__reloadDraft && window.__reloadDraft()
}
