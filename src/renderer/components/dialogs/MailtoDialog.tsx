import React from 'react'
import { Card, Classes } from '@blueprintjs/core'
import { DeltaDialogBase, DeltaDialogHeader } from './DeltaDialog'
import ChatListItem from '../chat/ChatListItem'
import { PseudoListItemNoSearchResults } from '../helpers/PseudoListItem'
import classNames from 'classnames'
import { DeltaBackend } from '../../delta-remote'
import { DialogProps } from './DialogController'

import { C } from 'deltachat-node/dist/constants'
import { ChatListPart, useLogicVirtualChatList } from '../chat/ChatList'
import { AutoSizer } from 'react-virtualized'
import { useChatList } from '../chat/ChatListHelpers'
import { selectChat } from '../../stores/chat'

export default function MailtoDialog(props: {
  messageText: string
  onClose: DialogProps['onClose']
}) {
  const tx = window.static_translate
  const { onClose, messageText } = props
  const { chatListIds, queryStr, setQueryStr } = useChatList(
    C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS
  )
  const { isChatLoaded, loadChats, chatCache } = useLogicVirtualChatList(
    chatListIds
  )

  const onChatClick = async (chatId: number) => {
    doMailtoAction(chatId, messageText)
    onClose()
  }

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQueryStr(e.target.value)

  const noResults = chatListIds.length === 0 && queryStr !== ''
  return (
    <DeltaDialogBase isOpen={true} onClose={onClose} fixed>
      <DeltaDialogHeader
        onClose={onClose}
        title={tx('mailto_dialog_header_select_chat')}
      />
      <div
        className={classNames(
          Classes.DIALOG_BODY,
          'bp3-dialog-body-no-footer',
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
            {noResults && PseudoListItemNoSearchResults({ queryStr })}
            <div style={noResults ? { height: '0px' } : {}} className='results'>
              <AutoSizer>
                {({ width, height }) => (
                  <ChatListPart
                    isRowLoaded={isChatLoaded}
                    loadMoreRows={loadChats}
                    rowCount={chatListIds.length}
                    width={width}
                    height={height}
                  >
                    {({ index, key, style }) => {
                      const [chatId] = chatListIds[index]
                      return (
                        <div style={style} key={key}>
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

export async function doMailtoAction(chatId: number, messageText: string) {
  const chat = await DeltaBackend.call('chatList.getFullChatById', chatId)
  const draft = await DeltaBackend.call('messageList.getDraft', chatId)

  selectChat(chatId)

  if (draft) {
    // ask if the draft should be replaced
    const continue_process = await new Promise((resolve, _reject) => {
      window.__openDialog('ConfirmationDialog', {
        message: window.static_translate(
          'mailto_dialog_confirm_replace_draft',
          chat.name
        ),
        confirmLabel: 'replace_draft',
        cb: resolve,
      })
    })
    if (!continue_process) {
      return
    }
  }

  await DeltaBackend.call('messageList.setDraft', chatId, { text: messageText })

  window.__reloadDraft && window.__reloadDraft()
}
