import React, { useRef, useState } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { C } from '@deltachat/jsonrpc-client'

import ChatListItem from '../../chat/ChatListItem'
import { PseudoListItemNoSearchResults } from '../../helpers/PseudoListItem'
import { ChatListPart, useLogicVirtualChatList } from '../../chat/ChatList'
import { useChatList } from '../../chat/ChatListHelpers'
import { useThemeCssVar } from '../../../ThemeManager'
import { selectedAccountId } from '../../../ScreenController'
import Dialog, { DialogBody, DialogHeader } from '../../Dialog'
import useCreateDraftMessage from '../../../hooks/chat/useCreateDraftMesssage'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'
import { RovingTabindexProvider } from '../../../contexts/RovingTabindex'

type Props = {
  messageText: string
}

export default function MailtoDialog(props: Props & DialogProps) {
  const { onClose, messageText } = props
  const listFlags = C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS

  const tx = useTranslationFunction()
  const createDraftMessage = useCreateDraftMessage()
  const accountId = selectedAccountId()
  const [queryStr, setQueryStr] = useState('')
  const { chatListIds } = useChatList(listFlags, queryStr)
  const { isChatLoaded, loadChats, chatCache } =
    useLogicVirtualChatList(chatListIds)

  const resultsRef = useRef<HTMLDivElement>(null)

  const onChatClick = async (chatId: number) => {
    createDraftMessage(accountId, chatId, messageText)
    onClose()
  }

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQueryStr(e.target.value)

  const CHATLISTITEM_CHAT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-chat-height')) || 64

  const noResults = chatListIds.length === 0 && queryStr !== ''

  return (
    <Dialog onClose={onClose} fixed className={styles.MailtoDialog}>
      <DialogHeader
        onClose={onClose}
        title={tx('mailto_dialog_header_select_chat')}
      />
      <DialogBody className={styles.MailtoDialogBody}>
        <div className='mailto-dialog'>
          <div className='select-chat-chat-list'>
            <input
              className='search-input no-drag'
              onChange={onSearchChange}
              value={queryStr}
              placeholder={tx('search')}
              autoFocus
              spellCheck={false}
            />
            {noResults && queryStr && (
              <PseudoListItemNoSearchResults queryStr={queryStr} />
            )}
            <div
              ref={resultsRef}
              style={noResults ? { height: '0px' } : {}}
              className='results'
            >
              <RovingTabindexProvider wrapperElementRef={resultsRef}>
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
              </RovingTabindexProvider>
            </div>
          </div>
        </div>
      </DialogBody>
    </Dialog>
  )
}
