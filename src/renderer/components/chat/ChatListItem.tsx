import React, { useContext } from 'react'
import classNames from 'classnames'
import Timestamp from '../conversations/Timestamp'
import MessageBody from '../message/MessageBody'
import { Avatar, VerifiedIcon } from '../contact/Contact'
import { C } from 'deltachat-node/dist/constants'
import { ScreenContext } from '../../contexts'
import { ChatListItemType } from '../../../shared/shared-types.d'

const FreshMessageCounter = React.memo(({ counter }: { counter: number }) => {
  if (counter === 0) return null
  return <div className='fresh-message-counter'>{counter}</div>
})

const Header = React.memo(
  ({ chatListItem }: { chatListItem: ChatListItemType }) => {
    const { lastUpdated, name, isVerified, pinned, muted } = chatListItem
    return (
      <div className='header'>
        <div className='name'>
          {isVerified && <VerifiedIcon />}
          <span>{name + ' '}</span>
        </div>
        {muted && (
          <div className='mute_icon' aria-label={window.translate('mute')} />
        )}
        {pinned && (
          <div className='pin_icon' aria-label={window.translate('pin')} />
        )}
        <div>
          <Timestamp
            timestamp={lastUpdated}
            extended={false}
            module='timestamp'
          />
        </div>
      </div>
    )
  }
)

const Message = React.memo(
  ({ chatListItem }: { chatListItem: ChatListItemType }) => {
    const { summary, freshMessageCounter, archived } = chatListItem
    if (!summary) return null

    return (
      <div className='chat-list-item-message'>
        <div className='text'>
          {summary.text1 !== null && (
            <div
              className={classNames('summary', {
                draft: summary.status === 'draft',
              })}
            >
              {summary.text1 + ': '}
            </div>
          )}
          <MessageBody text={summary.text2 || ''} disableJumbomoji preview />
        </div>
        {archived && (
          <div className='archived-label'>
            {window.translate('chat_archived_label')}
          </div>
        )}
        {!archived && summary.status && (
          <div className={classNames('status-icon', summary.status)} />
        )}
        <FreshMessageCounter counter={freshMessageCounter} />
      </div>
    )
  }
)

const PlaceholderChatListItem = React.memo(_ => {
  return <div className={classNames('chat-list-item', 'skeleton')} />
})

const ChatListItemArchiveLink = React.memo(
  ({
    chatListItem,
    onClick,
  }: {
    chatListItem: ChatListItemType
    onClick: () => void
  }) => {
    return (
      <div role='button' onClick={onClick} className={'chat-list-item'}>
        <div className='archive-link'>{chatListItem.name}</div>
      </div>
    )
  }
)

const ChatListItemNormal = React.memo<ChatListItemProps>(props => {
  const { chatListItem, onClick, isSelected, onContextMenu } = props
  return (
    <div
      role='button'
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={classNames('chat-list-item', {
        'has-unread': chatListItem.freshMessageCounter > 0,
        pinned: chatListItem.pinned,
        muted: chatListItem.muted,
        selected: isSelected,
      })}
    >
      <Avatar {...chatListItem} displayName={chatListItem.name} />
      <div className='content'>
        <Header chatListItem={chatListItem} />
        <Message chatListItem={chatListItem} />
      </div>
    </div>
  )
})

const ChatListItemDeaddrop = React.memo(
  ({ chatListItem }: { chatListItem: ChatListItemType }) => {
    const { openDialog } = useContext(ScreenContext)
    const onClick = () => openDialog('DeadDrop', chatListItem.deaddrop)
    const tx = window.translate
    return (
      <div
        role='button'
        onClick={onClick}
        className='chat-list-item is-deaddrop'
      >
        <Avatar displayName={chatListItem.deaddrop.contact.address} />
        <div className='content'>
          <Header
            chatListItem={{ ...chatListItem, name: tx('chat_contact_request') }}
          />
          <Message chatListItem={chatListItem} />
        </div>
      </div>
    )
  }
)

type ChatListItemProps = {
  chatListItem: ChatListItemType
  onClick: () => void
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  isSelected?: boolean
}

const ChatListItem = React.memo<ChatListItemProps>(
  props => {
    const { chatListItem, onClick } = props
    if (chatListItem === null) return null
    if (typeof chatListItem === 'undefined') return <PlaceholderChatListItem />
    if (chatListItem.id === C.DC_CHAT_ID_DEADDROP)
      return <ChatListItemDeaddrop chatListItem={chatListItem} />
    if (chatListItem.id === C.DC_CHAT_ID_ARCHIVED_LINK)
      return (
        <ChatListItemArchiveLink
          onClick={onClick}
          chatListItem={chatListItem}
        />
      )
    return (
      <ChatListItemNormal
        chatListItem={chatListItem}
        onClick={onClick}
        isSelected={props.isSelected}
        onContextMenu={props.onContextMenu}
      />
    )
  },
  (prevProps, nextProps) => {
    const shouldRerender =
      prevProps.chatListItem !== nextProps.chatListItem ||
      prevProps.isSelected !== nextProps.isSelected
    return !shouldRerender
  }
)

export default ChatListItem
