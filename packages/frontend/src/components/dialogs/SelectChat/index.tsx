import AutoSizer from 'react-virtualized-auto-sizer'
import React, { useRef, useState } from 'react'

import { ChatListItemRowChat } from '../../chat/ChatListItemRow'
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
  footer?: React.ReactElement
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
            className='search-input'
            data-no-drag-region
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
              <AutoSizer disableWidth>
                {({ height }) => (
                  <ChatListPart
                    olElementAttrs={{
                      'aria-label': tx('pref_chats'),
                    }}
                    isRowLoaded={isChatLoaded}
                    loadMoreRows={loadChats}
                    rowCount={chatListIds.length}
                    width={'100%'}
                    height={height}
                    itemKey={index => 'key' + chatListIds[index]}
                    itemHeight={CHATLISTITEM_CHAT_HEIGHT}
                    itemData={{
                      chatCache,
                      chatListIds,
                      onChatClick: props.onChatClick,

                      activeChatId: null,
                      activeContextMenuChatIds: [],
                      openContextMenu: async () => {},
                    }}
                  >
                    {ChatListItemRowChat}
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
