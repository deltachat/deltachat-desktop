import React from 'react'
import { Card, Classes } from '@blueprintjs/core'
import { DeltaDialogBase, DeltaDialogHeader } from './DeltaDialog'
import ChatListItem from '../chat/ChatListItem'
import { PseudoListItemNoSearchResults } from '../helpers/PseudoListItem'
import classNames from 'classnames'
import { DialogProps } from './DialogController'

import { C } from '@deltachat/jsonrpc-client'
import { ChatListPart, useLogicVirtualChatList } from '../chat/ChatList'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useChatList } from '../chat/ChatListHelpers'
import { useThemeCssVar } from '../../ThemeManager'
import { selectChat } from '../helpers/ChatMethods'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { runtime } from '../../runtime'

export default function WebxdcSaveToChatDialog(props: {
  messageText: string | null
  file: { file_name: string; file_content: string } | null
  onClose: DialogProps['onClose']
}) {
  const tx = window.static_translate
  const { onClose, messageText, file } = props
  const listFlags = C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS
  const { chatListIds, queryStr, setQueryStr } = useChatList(listFlags)
  const { isChatLoaded, loadChats, chatCache } = useLogicVirtualChatList(
    chatListIds,
    listFlags
  )

  const onChatClick = async (chatId: number) => {
    let path = null
    if (file) {
      path = await runtime.writeTempFileFromBase64(
        file.file_name,
        file.file_content
      )
    }
    await saveToChatAction(chatId, messageText, path)
    if (path) {
      await runtime.removeTempFile(path)
    }
    onClose()
  }

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQueryStr(e.target.value)

  const CHATLISTITEM_CHAT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-chat-height')) || 64

  const noResults = chatListIds.length === 0 && queryStr !== ''
  return (
    <DeltaDialogBase isOpen={true} onClose={onClose} fixed>
      <DeltaDialogHeader
        onClose={onClose}
        title={tx('chat_share_with_title')}
      />
      <div
        className={classNames(
          Classes.DIALOG_BODY,
          'bp4-dialog-body-no-footer',
          'mailto-dialog'
        )}
      >
        <Card style={{ padding: '0px' }}>
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
            <div style={noResults ? { height: '0px' } : {}} className='results'>
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
        </Card>
      </div>
    </DeltaDialogBase>
  )
}

async function saveToChatAction(
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
      window.__openDialog('ConfirmationDialog', {
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
    null
  )

  window.__reloadDraft && window.__reloadDraft()
}
