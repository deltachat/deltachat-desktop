import React from 'react'
import classNames from 'classnames'
import styled from 'styled-components'
import { Timestamp, ContactName } from './conversations'
import MessageBody from './MessageBody'
import { Avatar } from './helpers/Contact'

const MessageText1 = styled.div`
  float: left;
  margin-right: 2px;
`
const MessageText1Draft = styled.div`
  float: left;
  margin-right: 2px;
  color: ${props => props.theme.draftTextColor}
`

const UnreadCounter = React.memo(props => {
  const { unreadCount } = props
  if (unreadCount === 0) return null
  return (
    <div className='module-conversation-list-item__unread-count'>
      {unreadCount}
    </div>
  )
})

const VerifiedIcon = React.memo(props => {
  return <img className='module-conversation-list-item__is-verified' src='../images/verified.png' />
})

const GroupIcon = React.memo(props => {
  return <span className='module-conversation-list-item__is-group' />
})

const Header = React.memo(props => {
  const {
    unreadCount,
    lastUpdated,
    name,
    email,
    profileName,
    isVerified,
    isGroup
  } = props

  return (
    <div className='module-conversation-list-item__header'>
      <div className={classNames(
        'module-conversation-list-item__header__name',
        unreadCount > 0 ? 'module-conversation-list-item__header__name--with-unread' : null
     )}>
        {isVerified && <VerifiedIcon />}
        {isGroup && <GroupIcon />}
        <ContactName email={email} name={name} profileName={profileName} />
      </div>
      <div className={classNames(
        'module-conversation-list-item__header__date',
        unreadCount > 0 ? 'module-conversation-list-item__header__date--has-unread' : null
      )}>
        <Timestamp
          timestamp={lastUpdated}
          extended={false}
          module='module-conversation-list-item__header__timestamp'
        />
      </div>
    </div>
  )
})

export const Message = React.memo(props => {
  const { summary, unreadCount } = props

  if (!summary) return null

  const Text1 = summary.status === 'draft' ? MessageText1Draft : MessageText1

  return (
    <div className='module-conversation-list-item__message'>
      <div className={classNames(
        'module-conversation-list-item__message__text',
        unreadCount > 0 ? 'module-conversation-list-item__message__text--has-unread' : null
      )}>
        { summary.text1 !== null ? (<Text1>{summary.text1 + ': ' }</Text1>) : null }
        <MessageBody text={summary.text2 || ''} disableJumbomoji preview/>
      </div>
      { summary.status ?
        (<div className={classNames('status-icon', `status-icon--${summary.status}`)}/>) :
        null
      }
      <UnreadCounter unreadCount={unreadCount} />
    </div>
  )
})

const ChatListItem = React.memo(props => {
  const { unreadCount, lastUpdated, email,profileName, isVerified, isGroup, avatarPath, color, name, summary } = props.chatListItem
  const { onClick, isSelected, onContextMenu } = props
  console.log('rendering', props.chatListItem)
  return (
    <div
      role='button'
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={classNames(
        'module-conversation-list-item',
        unreadCount > 0 ? 'module-conversation-list-item--has-unread' : null,
        isSelected ? 'module-conversation-list-item--is-selected' : null
      )}
    >
      {<Avatar {...{avatarPath, color, displayName: name}} />}
      <div className='module-conversation-list-item__content'>
        <Header {...{unreadCount, lastUpdated, name,  email,profileName, isVerified, isGroup}}/>
        <Message {...{summary, unreadCount}}/>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  const shouldRerender = prevProps.chatListItem != nextProps.chatListItem || prevProps.isSelected !== nextProps.isSelected
  return !shouldRerender
})

export default ChatListItem
