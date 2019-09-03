import React from 'react'
import classNames from 'classnames'
import styled from 'styled-components'
import { Timestamp } from './conversations'
import MessageBody from './MessageBody'
import { Avatar, VerifiedIcon } from './helpers/Contact'

const MessageText1 = styled.div`
  float: left;
  margin-right: 2px;
`
const MessageText1Draft = styled.div`
  float: left;
  margin-right: 2px;
  color: ${props => props.theme.draftTextColor}
`


const UnreadCounterDiv = styled.div`
  color: var(--unreadCountLabel);
  background-color: var(--unreadCountBg);
  text-align: center;

  // For alignment with the message text
  margin-top: 1px;

  font-size: 9pt;
  margin-left: 5px;
  height: 20px;
  padding: 0 5pt;
  line-height: 20px;
  border-radius: 10px;
  font-weight: bold;
`
const UnreadCounter = React.memo(props => {
  const { unreadCount } = props
  if (unreadCount === 0) return null
  return (
    <UnreadCounterDiv>{unreadCount}</UnreadCounterDiv>
  )
})

const GroupIcon = styled.span`
  display: inline-block;
  width: 0.75em;
  height: 0.75em;
  margin-right: 2px;
  -webkit-mask: url(../images/group-icon.svg) no-repeat center;
  -webkit-mask-size: 100%;
  background-color: var(--globalText);
`

const ContactNameSpan = styled.span`
  font-weight: 200;
  font-size: medium;
  color: ${({isSelected}) => isSelected ? props.theme.chatListItemSelectedText : 'unset'};
  
`

const Header = React.memo(props => {
  const {
    unreadCount,
    lastUpdated,
  } = props.chatListItem
  const { name, email, isVerified, isGroup, isSelected } = props.chatListItem

  return (
    <div className='module-conversation-list-item__header'>
      <div className={classNames(
        'module-conversation-list-item__header__name',
        unreadCount > 0 ? 'module-conversation-list-item__header__name--with-unread' : null
      )}>
        {isGroup && <GroupIcon />}
        {isVerified && <VerifiedIcon />}
        <ContactNameSpan isSelected={isSelected}>
          {name || email}
          {' '}
        </ContactNameSpan>
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
  const { summary, unreadCount } = props.chatListItem

  if (!summary) return null

  const Text1 = summary.status === 'draft' ? MessageText1Draft : MessageText1

  return (
    <div className='module-conversation-list-item__message'>
      <div className={classNames(
        'module-conversation-list-item__message__text',
        unreadCount > 0 ? 'module-conversation-list-item__message__text--has-unread' : null
      )}>
        { summary.text1 !== null ? (<Text1>{summary.text1 + ': ' }</Text1>) : null }
        <MessageBody text={summary.text2 || ''} disableJumbomoji preview />
      </div>
      { summary.status
        ? (<div className={classNames('status-icon', `status-icon--${summary.status}`)} />)
        : null
      }
      <UnreadCounter unreadCount={unreadCount} />
    </div>
  )
})

const ChatListItem = React.memo(props => {
  const { chatListItem } = props
  const { onClick, isSelected, onContextMenu } = props
  console.log('rendering', props.chatListItem)
  return (
    <div
      role='button'
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={classNames(
        'module-conversation-list-item',
        chatListItem.unreadCount > 0 ? 'module-conversation-list-item--has-unread' : null,
        isSelected ? 'module-conversation-list-item--is-selected' : null
      )}
    >
      {<Avatar {...chatListItem} displayName={chatListItem.name}  />}
      <div className='module-conversation-list-item__content'>
        <Header chatListItem={chatListItem} />
        <Message chatListItem={chatListItem} />
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  const shouldRerender = prevProps.chatListItem != nextProps.chatListItem || prevProps.isSelected !== nextProps.isSelected
  return !shouldRerender
})

export default ChatListItem
