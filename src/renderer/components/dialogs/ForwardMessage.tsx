import React from 'react'
import { Card, Classes } from '@blueprintjs/core'
import { DeltaDialogBase, DeltaDialogHeader } from './DeltaDialog'
import ChatListItem from '../chat/ChatListItem'
import { PseudoListItemNoSearchResults } from '../helpers/PseudoListItem'
import classNames from 'classnames'
import { DeltaBackend } from '../../delta-remote'
import { DialogProps } from './DialogController'
import { MessageType } from '../../../shared/shared-types'

import { C } from 'deltachat-node/dist/constants'
import { ChatListPart, useLogicVirtualChatList } from '../chat/ChatList'
import { AutoSizer } from 'react-virtualized'
import { useChatList } from '../chat/ChatListHelpers'

export default function ForwardMessage(props: {
  message: MessageType
  onClose: DialogProps['onClose']
}) {
  const tx = window.static_translate
  const { message, onClose } = props
  const { chatListIds, queryStr, setQueryStr } = useChatList(
    C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS
  )
  const { isChatLoaded, loadChats, chatCache } = useLogicVirtualChatList(
    chatListIds
  )

  const onChatClick = (chatid: number) => {
    DeltaBackend.call('messageList.forwardMessage', message.msg.id, chatid)
    onClose()
  }
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQueryStr(e.target.value)

  var isOpen = !!message
  let noResults = chatListIds.length === 0 && queryStr !== ''
  return (
    <DeltaDialogBase isOpen={isOpen} onClose={onClose} fixed>
      <DeltaDialogHeader onClose={onClose}>
        <input
          className='search-input'
          onChange={onSearchChange}
          value={queryStr}
          placeholder={tx('contacts_enter_name_or_email')}
          autoFocus
        />
      </DeltaDialogHeader>
      <div
        className={classNames(
          Classes.DIALOG_BODY,
          '.bp3-dialog-body-no-footer'
        )}
      >
        <Card style={{ padding: '0px' }}>
          <div className='forward-message-list-chat-list'>
            {noResults && PseudoListItemNoSearchResults({ queryStr })}
            <div style={{ height: noResults ? '0px' : '100%' }}>
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
