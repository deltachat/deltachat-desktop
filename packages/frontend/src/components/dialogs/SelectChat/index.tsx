import AutoSizer from 'react-virtualized-auto-sizer'
import React, { useRef, useState } from 'react'

import ChatListItem from '../../chat/ChatListItem'
import { PseudoListItemNoSearchResults } from '../../helpers/PseudoListItem'
import { ChatListPart, useLogicVirtualChatList } from '../../chat/ChatList'
import { useChatList } from '../../chat/ChatListHelpers'
import { useThemeCssVar } from '../../../ThemeManager'
import Dialog, { DialogBody, DialogHeader } from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'
import { RovingTabindexProvider } from '../../../contexts/RovingTabindex'

type Props = {
  onClose: DialogProps['onClose']
  headerTitle: string
  onChatClick: (chatId: number) => void
  listFlags: number
  footer?: React.JSX.Element
}

export default function SelectChat(props: Props) {
  const tx = useTranslationFunction()

  const [queryStr, setQueryStr] = useState('')
  const { chatListIds } = useChatList(props.listFlags, queryStr)
  const { isChatLoaded, loadChats, chatCache } =
    useLogicVirtualChatList(chatListIds)

  const chatListRef = useRef<HTMLDivElement>(null)

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQueryStr(e.target.value)

  const noResults = chatListIds.length === 0 && queryStr !== ''

  const CHATLISTITEM_CHAT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-chat-height')) || 64

  return (
    <Dialog className={styles.selectChatDialog} onClose={props.onClose} fixed>
      <DialogHeader onClose={props.onClose} title={props.headerTitle} />
      <DialogBody className={styles.selectChatDialogBody}>
        <div className='select-chat-account-input'>
          <input
            className='search-input no-drag'
            onChange={onSearchChange}
            value={queryStr}
            placeholder={tx('search')}
            autoFocus
            spellCheck={false}
          />
        </div>
        <div className='select-chat-list-chat-list' ref={chatListRef}>
          <RovingTabindexProvider wrapperElementRef={chatListRef}>
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
                      const chatId = chatListIds[index]
                      return (
                        <div style={style}>
                          <ChatListItem
                            chatListItem={chatCache[chatId] || undefined}
                            onClick={props.onChatClick.bind(null, chatId)}
                          />
                        </div>
                      )
                    }}
                  </ChatListPart>
                )}
              </AutoSizer>
            </div>
          </RovingTabindexProvider>
        </div>
      </DialogBody>
      {props.footer}
    </Dialog>
  )
}
