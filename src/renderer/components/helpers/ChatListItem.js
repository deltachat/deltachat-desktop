import React from 'react'
import classNames from 'classnames'
import styled from 'styled-components'
import { Timestamp } from '../conversations'
import MessageBody from '../MessageBody'
import { Avatar, VerifiedIcon } from '../helpers/Contact'

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
  const { freshMessageCounter } = props
  if (freshMessageCounter === 0) return null
  return (
    <UnreadCounterDiv>{freshMessageCounter}</UnreadCounterDiv>
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
  color: ${({ isSelected, theme }) => isSelected ? theme.chatListItemSelectedText : 'unset'};
  
`

const Header = React.memo(props => {
  const {
    freshMessageCounter,
    lastUpdated
  } = props.chatListItem
  const { name, email, isVerified, isGroup, isSelected } = props.chatListItem

  return (
    <div className='module-conversation-list-item__header'>
      <div className={classNames(
        'module-conversation-list-item__header__name',
        freshMessageCounter > 0 ? 'module-conversation-list-item__header__name--with-unread' : null
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
        freshMessageCounter > 0 ? 'module-conversation-list-item__header__date--has-unread' : null
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
  const { summary, freshMessageCounter } = props.chatListItem

  if (!summary) return null

  const Text1 = summary.status === 'draft' ? MessageText1Draft : MessageText1

  return (
    <div className='module-conversation-list-item__message'>
      <div className={classNames(
        'module-conversation-list-item__message__text',
        freshMessageCounter > 0 ? 'module-conversation-list-item__message__text--has-unread' : null
      )}>
        { summary.text1 !== null ? (<Text1>{summary.text1 + ': ' }</Text1>) : null }
        <MessageBody text={summary.text2 || ''} disableJumbomoji preview />
      </div>
      { summary.status
        ? (<div className={classNames('status-icon', `status-icon--${summary.status}`)} />)
        : null
      }
      <UnreadCounter freshMessageCounter={freshMessageCounter} />
    </div>
  )
})

export const PlaceholderChatListItem = React.memo((props) => {
  return (
    <div style={{ height: '64px' }} />
  )
})

const ChatListItemWrapper = styled.div`
  span.module-contact-name {
    font-weight: 200;
    font-size: medium;
  }

  .module-conversation-list-item:hover {
    background-color: ${props => props.theme.chatListItemBgHover}
  }

  .module-conversation-list-item--is-selected {
    background-color: ${props => props.theme.chatListItemSelectedBg};
    color: ${props => props.theme.chatListItemSelectedText};

    span.module-contact-name {
      color: ${props => props.theme.chatListItemSelectedText};
    }

    .module-conversation-list-item__is-group {
      filter: unset;
    }

    &:hover {
        background-color: var(--chatListItemSelectedBg);
    }
  }

  .module-conversation-list-item__header__name {
    width: 90%;
  }

  .status-icon {
    flex-shrink: 0;
    margin-top: 2px;
    margin-left: calc(100% - 90% - 12px);
  }
`
const ChatListItem = React.memo(props => {
  const { chatListItem, onClick, isSelected, onContextMenu } = props
  if (typeof chatListItem === 'undefined') return <PlaceholderChatListItem />
  return (
    <ChatListItemWrapper>
      <div
        role='button'
        onClick={onClick}
        onContextMenu={onContextMenu}
        className={classNames(
          'module-conversation-list-item',
          chatListItem.freshMessageCounter > 0 ? 'module-conversation-list-item--has-unread' : null,
          isSelected ? 'module-conversation-list-item--is-selected' : null
        )}
      >
        {<Avatar {...chatListItem} displayName={chatListItem.name} />}
        <div className='module-conversation-list-item__content'>
          <Header chatListItem={chatListItem} />
          <Message chatListItem={chatListItem} />
        </div>
      </div>
    </ChatListItemWrapper>
  )
}, (prevProps, nextProps) => {
  const shouldRerender = prevProps.chatListItem !== nextProps.chatListItem || prevProps.isSelected !== nextProps.isSelected
  return !shouldRerender
})

export default ChatListItem
