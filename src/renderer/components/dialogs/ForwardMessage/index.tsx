import AutoSizer from 'react-virtualized-auto-sizer'
import React from 'react'
import { C, T } from '@deltachat/jsonrpc-client'

import ChatListItem from '../../chat/ChatListItem'
import { PseudoListItemNoSearchResults } from '../../helpers/PseudoListItem'
import { ChatListPart, useLogicVirtualChatList } from '../../chat/ChatList'
import { useChatList } from '../../chat/ChatListHelpers'
import { useThemeCssVar } from '../../../ThemeManager'
import { BackendRemote } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import { forwardMessage, selectChat } from '../../helpers/ChatMethods'
import { confirmForwardMessage } from '../../message/messageFunctions'
import Dialog, { DialogBody, DialogHeader } from '../../Dialog'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import useDialog from '../../../hooks/useDialog'

import type { DialogProps } from '../../../contexts/DialogContext'

import styles from './styles.module.scss'

const LIST_FLAGS = C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS

export default function ForwardMessage(props: {
  message: T.Message
  onClose: DialogProps['onClose']
}) {
  const accountId = selectedAccountId()
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()

  const { message, onClose } = props
  const { chatListIds, queryStr, setQueryStr } = useChatList(LIST_FLAGS)
  const { isChatLoaded, loadChats, chatCache } = useLogicVirtualChatList(
    chatListIds,
    LIST_FLAGS
  )

  const onChatClick = async (chatId: number) => {
    const chat = await BackendRemote.rpc.getFullChatById(accountId, chatId)
    onClose()
    if (!chat.isSelfTalk) {
      selectChat(chat.id)
      const yes = await confirmForwardMessage(
        openDialog,
        accountId,
        message,
        chat
      )
      if (!yes) {
        selectChat(message.chatId)
      }
    } else {
      await forwardMessage(accountId, message.id, chat.id)
    }
  }
  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setQueryStr(e.target.value)

  const noResults = chatListIds.length === 0 && queryStr !== ''

  const CHATLISTITEM_CHAT_HEIGHT =
    Number(useThemeCssVar('--SPECIAL-chatlist-item-chat-height')) || 64

  return (
    <Dialog className={styles.forwardMessageDialog} onClose={onClose} fixed>
      <DialogHeader onClose={onClose} title={tx('forward_to')} />
      <DialogBody className={styles.forwardMessageDialogBody}>
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
      </DialogBody>
    </Dialog>
  )
}
