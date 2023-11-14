import React from 'react'
import { Card, Classes } from '@blueprintjs/core'
import classNames from 'classnames'
import { C } from '@deltachat/jsonrpc-client'
import AutoSizer from 'react-virtualized-auto-sizer'

import { DeltaDialogBase, DeltaDialogHeader } from './DeltaDialog'
import ChatListItem from '../chat/ChatListItem'
import { PseudoListItemNoSearchResults } from '../helpers/PseudoListItem'
import { ChatListPart, useLogicVirtualChatList } from '../chat/ChatList'
import { useChatList } from '../chat/ChatListHelpers'
import { useThemeCssVar } from '../../ThemeManager'
import { createDraftMessage } from '../helpers/ChatMethods'
import { useTranslationFunction } from '../../hooks/useTranslationFunction'
import { useDialog } from '../../hooks/useDialog'

import type { DialogProps } from '../../contexts/DialogContext'

export default function MailtoDialog(props: {
  messageText: string
  onClose: DialogProps['onClose']
}) {
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const { onClose, messageText } = props
  const listFlags = C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS
  const { chatListIds, queryStr, setQueryStr } = useChatList(listFlags)
  const { isChatLoaded, loadChats, chatCache } = useLogicVirtualChatList(
    chatListIds,
    listFlags
  )

  const onChatClick = async (chatId: number) => {
    createDraftMessage(openDialog, chatId, messageText)
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
        title={tx('mailto_dialog_header_select_chat')}
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
