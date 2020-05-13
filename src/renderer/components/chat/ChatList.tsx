import React, { useRef, useEffect } from 'react'
import ChatListContextMenu from './ChatListContextMenu'
import { useChatListIds, useLazyChatListItems } from './ChatListHelpers'
import ChatListItem from './ChatListItem'
import { PseudoListItemAddContact } from '../helpers/PseudoListItem'
import { C } from 'deltachat-node/dist/constants'
import { selectChat } from '../../stores/chat'
import { DeltaBackend } from '../../delta-remote'
import { isValidEmail } from '../../../shared/util'

export default function ChatList(props: {
  selectedChatId: number
  showArchivedChats: boolean
  onShowArchivedChats: () => void
  queryStr?: string
  onChatClick: (chatId: number) => void
}) {
  const {
    selectedChatId,
    showArchivedChats,
    onShowArchivedChats,
    queryStr,
  } = props
  const queryStrIsEmail = isValidEmail(queryStr)
  const { chatListIds, setQueryStr, setListFlags } = useChatListIds()
  const { chatItems, onChatListScroll, scrollRef } = useLazyChatListItems(
    chatListIds
  )
  const realOpenContextMenu = useRef(null)

  const onChatClick = (chatId: number) => {
    if (chatId === C.DC_CHAT_ID_ARCHIVED_LINK) return onShowArchivedChats()
    props.onChatClick(chatId)
  }

  useEffect(() => setQueryStr(queryStr), [queryStr])
  useEffect(
    () =>
      showArchivedChats
        ? setListFlags(C.DC_GCL_ARCHIVED_ONLY)
        : setListFlags(0),
    [showArchivedChats]
  )

  const openContextMenu = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    chatId: number
  ) => {
    if (realOpenContextMenu.current === null)
      throw new Error(
        'Tried to open ChatListContextMenu before we recieved open method'
      )
    const chat = chatItems[chatId]
    realOpenContextMenu.current(event, chat)
  }

  const addContactOnClick = async () => {
    if (!queryStrIsEmail) return

    const contactId = await DeltaBackend.call(
      'contacts.createContact',
      queryStr
    )
    const chatId = await DeltaBackend.call(
      'contacts.createChatByContactId',
      contactId
    )
    selectChat(chatId)
  }

  const renderAddContactIfNeeded = () => {
    if (queryStr === '' || chatListIds.length > 0) return null
    return PseudoListItemAddContact({
      queryStr,
      queryStrIsEmail,
      onClick: addContactOnClick,
    })
  }

  return (
    <>
      <div className='chat-list' ref={scrollRef} onScroll={onChatListScroll}>
        {chatListIds.map(chatId => {
          return (
            <ChatListItem
              isSelected={selectedChatId === chatId}
              key={chatId}
              chatListItem={chatItems[chatId]}
              onClick={onChatClick.bind(null, chatId)}
              onContextMenu={event => {
                openContextMenu(event, chatId)
              }}
            />
          )
        })}
        {chatListIds.length === 0 && queryStr === '' && null}
        {renderAddContactIfNeeded()}
      </div>
      <ChatListContextMenu
        showArchivedChats={showArchivedChats}
        getShow={show => {
          realOpenContextMenu.current = show
        }}
      />
    </>
  )
}
