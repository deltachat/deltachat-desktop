import React from 'react'
import { Card, Classes } from '@blueprintjs/core'
import { DeltaDialogBase, DeltaDialogHeader } from './DeltaDialog'
import ChatListItem from '../chat/ChatListItem'
import { PseudoListItemNoSearchResults } from '../helpers/PseudoListItem'
import classNames from 'classnames'
import { DialogProps } from './DialogController'

import { C, T } from '@deltachat/jsonrpc-client'
import { ChatListPart, useLogicVirtualChatList } from '../chat/ChatList'
import AutoSizer from 'react-virtualized-auto-sizer'
import { useChatList } from '../chat/ChatListHelpers'
import { useThemeCssVar } from '../../ThemeManager'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { selectChat } from '../helpers/ChatMethods'
import { confirmForwardMessage } from '../message/messageFunctions'

export default function ForwardMessage(props: {
  message: T.Message
  onClose: DialogProps['onClose']
}) {
  const accountId = selectedAccountId()
  const tx = window.static_translate
  const { message, onClose } = props
  const { chatListIds, queryStr, setQueryStr } = useChatList(
    C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS
  )
  const { isChatLoaded, loadChats, chatCache } = useLogicVirtualChatList(
    chatListIds
  )

  const onChatClick = async (chatId: number) => {
    const chat = await BackendRemote.rpc.getFullChatById(accountId, chatId)
    onClose()
    if (!chat.isSelfTalk) {
      selectChat(chat.id)
    }
    const yes = await confirmForwardMessage(accountId, message, chat)
    if (!yes) {
      selectChat(message.chatId)
    }
  }
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQueryStr(e.target.value)

  const isOpen = !!message
  const noResults = chatListIds.length === 0 && queryStr !== ''

  const CHATLISTITEM_CHAT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-chat-height')) || 64
  return (
    <DeltaDialogBase isOpen={isOpen} onClose={onClose} fixed>
      <DeltaDialogHeader
        onClose={onClose}
        title={tx('forward_to')}
      ></DeltaDialogHeader>
      <div
        className={classNames(
          Classes.DIALOG_BODY,
          '.bp4-dialog-body-no-footer'
        )}
      >
        <Card style={{ padding: '0px' }}>
          <div className='forward-message-account-input'>
            <input
              className='search-input'
              onChange={onSearchChange}
              value={queryStr}
              placeholder={tx('search')}
              autoFocus
              spellCheck={false}
            />
          </div>
          <div className='forward-message-list-chat-list'>
            {noResults && queryStr && (
              <PseudoListItemNoSearchResults queryStr={queryStr} />
            )}
            <div style={{ height: noResults ? '0px' : '100%' }}>
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
                      const [chatId] = chatListIds[index]
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
