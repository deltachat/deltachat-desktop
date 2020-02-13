import React, { useContext } from 'react'
import classNames from 'classnames'
import { Timestamp } from '../conversations'
import MessageBody from '../message/MessageBody'
import { Avatar, VerifiedIcon } from '../contact/Contact'
import {C} from 'deltachat-node'
import { ScreenContext } from '../../contexts'

const FreshMessageCounter = React.memo(props => {
  const { counter } = props
  if (counter === 0) return null
  return <div className='chat-list-item__fresh-message-counter' >{counter}</div>
})

const Header = React.memo(props => {
  const {
    lastUpdated,
    name,
    isVerified
  } = props.chatListItem

  return (
    <div className='chat-list-item__header'>
      <div className='chat-list-item__header__name'>
        {isVerified && <VerifiedIcon />}
        <span className='chat-list-item__name'>
          {name + ' '}
        </span>
      </div>
      <div className='chat-list-item__header__date'>
        <Timestamp
          timestamp={lastUpdated}
          extended={false}
          module='chat-list-item__header__timestamp'
        />
      </div>
    </div>
  )
})

export const Message = React.memo(props => {
  const { summary, freshMessageCounter } = props.chatListItem
  if (!summary) return null

  return (
    <div className='chat-list-item__message'>
      <div className='chat-list-item__message__text'>
        {summary.text1 !== null &&
          <div className={classNames(
            'chat-list-item__message__text__summary',
            { 'chat-list-item__message__text__summary--draft': summary.status === 'draft' }
          )}>{summary.text1 + ': '}</div>
        }
        <MessageBody text={summary.text2 || ''} disableJumbomoji preview />
      </div>
      {summary.status && <div className={classNames('status-icon', summary.status)} />}
      <FreshMessageCounter counter={freshMessageCounter} />
    </div>
  )
})

export const PlaceholderChatListItem = React.memo((props) => {
  return <div
    className={classNames(
      'chat-list-item',
      props.className,
      'skeleton'
    )}
  />
})

const ChatListItemArchiveLink = React.memo(props => {
  const { chatListItem, onClick } = props
  return (
    <div
      role='button'
      onClick={onClick}
      className={'chat-list-item'}
    >
      <div className='chat-list-item__archive-link'>{chatListItem.name}</div>
    </div>
  )
})

const ChatListItemNormal = React.memo(props => {
  const { chatListItem, onClick, isSelected, onContextMenu } = props
  return (
    <div
      role='button'
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={classNames(
        'chat-list-item',
        {
          'has-unread': chatListItem.freshMessageCounter > 0,
          'chat-list-item--is-selected': isSelected
        },
        props.className
      )}
    >
      <Avatar {...chatListItem} displayName={chatListItem.name} />
      <div className='chat-list-item__content'>
        <Header chatListItem={chatListItem} />
        <Message chatListItem={chatListItem} />
      </div>
    </div>
  )
})

const ChatListItemDeaddrop = React.memo(props => {
  const { chatListItem } = props
  const { openDialog } = useContext(ScreenContext)
  const onClick = () => openDialog('DeadDrop', chatListItem.deaddrop)
  const tx = window.translate
  return (
    <div
      role='button'
      onClick={onClick}
      className={classNames(
        'chat-list-item',
        'chat-list-item--is-deaddrop'
      )}
    >
      <Avatar displayName={chatListItem.deaddrop.contact.address} />
      <div className='chat-list-item__content'>
        <Header chatListItem={{ ...chatListItem, name: tx('chat_contact_request') }} />
        <Message chatListItem={chatListItem} />
      </div>
    </div>
  )
})

const ChatListItem = React.memo(props => {
  const { chatListItem, onClick } = props
  if (chatListItem === null) return null
  if (typeof chatListItem === 'undefined') return <PlaceholderChatListItem />
  if (chatListItem.id === C.DC_CHAT_ID_DEADDROP) return <ChatListItemDeaddrop chatListItem={chatListItem} />
  if (chatListItem.id === C.DC_CHAT_ID_ARCHIVED_LINK) return <ChatListItemArchiveLink onClick={onClick} chatListItem={chatListItem} />
  return <ChatListItemNormal {...props} />
}, (prevProps, nextProps) => {
  const shouldRerender = prevProps.chatListItem !== nextProps.chatListItem || prevProps.isSelected !== nextProps.isSelected
  return !shouldRerender
})

export default ChatListItem
