import AutoSizer from 'react-virtualized-auto-sizer'
import React, { useState } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import ChatListItem from '../../chat/ChatListItem'
import { PseudoListItemNoSearchResults } from '../../helpers/PseudoListItem'
import { ChatListPart, useLogicVirtualChatList } from '../../chat/ChatList'
import { useChatList } from '../../chat/ChatListHelpers'
import { useThemeCssVar } from '../../../ThemeManager'
import { BackendRemote } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import { confirmForwardMessage } from '../../message/messageFunctions'
import Dialog, { DialogBody, DialogHeader } from '../../Dialog'
import useChat from '../../../hooks/chat/useChat'
import useDialog from '../../../hooks/dialog/useDialog'
import useMessage from '../../../hooks/chat/useMessage'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import styles from './styles.module.scss'

import type { T } from '@deltachat/jsonrpc-client'
import type { DialogProps } from '../../../contexts/DialogContext'

type Props = {
  message: T.Message
  onClose: DialogProps['onClose']
}

const LIST_FLAGS = C.DC_GCL_FOR_FORWARDING | C.DC_GCL_NO_SPECIALS

export default function ForwardMessage(props: Props) {
  const { message, onClose } = props

  const accountId = selectedAccountId()
  const tx = useTranslationFunction()
  const { openDialog } = useDialog()
  const { selectChat } = useChat()
  const { forwardMessage, jumpToMessage } = useMessage()

  const [queryStr, setQueryStr] = useState('')
  const { chatListIds } = useChatList(LIST_FLAGS, queryStr)
  const { isChatLoaded, loadChats, chatCache } =
    useLogicVirtualChatList(chatListIds)

  const onChatClick = async (chatId: number) => {
    const chat = await BackendRemote.rpc.getFullChatById(accountId, chatId)
    onClose()
    if (!chat.isSelfTalk) {
      // show the target chat to avoid unintended forwarding to the wrong chat
      selectChat(accountId, chat.id)
      const yes = await confirmForwardMessage(
        openDialog,
        accountId,
        message,
        chat
      )
      if (yes) {
        // get the id of forwarded message
        // to jump to the message
        const messageIds = await BackendRemote.rpc.getMessageIds(
          accountId,
          chatId,
          false,
          true
        )
        const lastMessage = messageIds[messageIds.length - 1]
        if (lastMessage) {
          jumpToMessage(accountId, lastMessage)
        }
      } else {
        selectChat(accountId, message.chatId)
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
