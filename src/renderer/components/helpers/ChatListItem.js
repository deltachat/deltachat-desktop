import React from 'react'
import classNames from 'classnames'
import styled from 'styled-components'
import { Timestamp } from '../conversations'
import MessageBody from '../MessageBody'
import { Avatar, VerifiedIcon } from '../helpers/Contact'

const FreshMessageCounter = React.memo(props => {
  const { counter } = props
  if (counter === 0) return null
  return (
    <div className='chat-list-item__fresh-message-counter' >{counter}</div>
  )
})

const Header = React.memo(props => {
  const {
    freshMessageCounter,
    lastUpdated
  } = props.chatListItem
  const { name, email, isVerified, isGroup, isSelected } = props.chatListItem

  return (
    <div className='chat-list-item__header'>
      <div className={classNames(
        'chat-list-item__header__name',
        freshMessageCounter > 0 ? 'chat-list-item__header__name--with-unread' : null
      )}>
        {isGroup && <div className='chat-list-item__group-icon' />}
        {isVerified && <VerifiedIcon />}
        <span classNames='chat-list-item__name'>
          {name || email}
          {' '}
        </span>
      </div>
      <div className={classNames(
        'chat-list-item__header__date',
        freshMessageCounter > 0 ? 'chat-list-item__header__date--has-unread' : null
      )}>
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
      <div className={classNames(
        'chat-list-item__message__text',
        freshMessageCounter > 0 ? 'chat-list-item__message__text--has-unread' : null
      )}>
        { summary.text1 !== null && 
          <div className={classNames(
              'chat-list-item__message__text__summary',
              { 'chat-list-item__message__text__summary--draft' : summary.status === 'draft' }
          )}>{summary.text1 + ': ' }</div>
        }
        <MessageBody text={summary.text2 || ''} disableJumbomoji preview />
      </div>
      { summary.status
        ? (<div className='chat-list-item__status-icon' />)
        : null
      }
      <FreshMessageCounter counter={freshMessageCounter} />
    </div>
  )
})

export const PlaceholderChatListItem = React.memo((props) => {
  return (
    <div style={{ height: '64px' }} />
  )
})

const ChatListItem = React.memo(props => {
  const { chatListItem, onClick, isSelected, onContextMenu } = props
  if (chatListItem === null) return null
  if (typeof chatListItem === 'undefined') return <PlaceholderChatListItem />
  return (
    <div
      role='button'
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={classNames(
        'chat-list-item',
        chatListItem.freshMessageCounter > 0 ? 'chat-list-item--has-unread' : null,
        isSelected ? 'chat-list-item--is-selected' : null
      )}
    >
      {<Avatar {...chatListItem} displayName={chatListItem.name} />}
      <div className='chat-list-item__content'>
        <Header chatListItem={chatListItem} />
        <Message chatListItem={chatListItem} />
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  const shouldRerender = prevProps.chatListItem !== nextProps.chatListItem || prevProps.isSelected !== nextProps.isSelected
  return !shouldRerender
})

export default ChatListItem
