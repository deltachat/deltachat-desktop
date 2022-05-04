import React from 'react'
import classNames from 'classnames'
import Timestamp from '../conversations/Timestamp'
import MessageBody from '../message/MessageBody'
import { C } from 'deltachat-node/dist/constants'
import {
  ChatListItemType,
  MessageSearchResult,
} from '../../../shared/shared-types'
import { Avatar } from '../Avatar'

const FreshMessageCounter = React.memo(({ counter }: { counter: number }) => {
  if (counter === 0) return null
  return <div className='fresh-message-counter'>{counter}</div>
})

const Header = React.memo(
  ({ chatListItem }: { chatListItem: ChatListItemType }) => {
    const { lastUpdated, name, pinned, muted } = chatListItem
    const tx = window.static_translate
    return (
      <div className='header'>
        <div className='name'>
          <span>{name + ' '}</span>
        </div>
        {muted && <div className='mute_icon' aria-label={tx('mute')} />}
        {pinned && <div className='pin_icon' aria-label={tx('pin')} />}
        <div>
          {lastUpdated !== 0 && (
            <Timestamp
              timestamp={lastUpdated}
              extended={false}
              module='timestamp'
            />
          )}
        </div>
      </div>
    )
  }
)

const Message = React.memo(
  ({ chatListItem }: { chatListItem: ChatListItemType }) => {
    const {
      summary,
      freshMessageCounter,
      archived,
      isContactRequest,
    } = chatListItem
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
        {isContactRequest && (
          <div className='label'>
            {window.static_translate('chat_request_label')}
          </div>
        )}
        {archived && (
          <div className='label'>
            {window.static_translate('chat_archived_label')}
          </div>
        )}
        {!archived && !isContactRequest && summary.status && (
          <div className={classNames('status-icon', summary.status)} />
        )}
        {!isContactRequest && (
          <FreshMessageCounter counter={freshMessageCounter} />
        )}
      </div>
    )
  }
)

export const PlaceholderChatListItem = React.memo(_ => {
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
        'is-contact-request': chatListItem.isContactRequest,
        pinned: chatListItem.pinned,
        muted: chatListItem.muted,
        selected: isSelected,
      })}
    >
      <Avatar
        {...{
          displayName: chatListItem.name,
          avatarPath: chatListItem.avatarPath,
          color: chatListItem.color,
          isVerified: chatListItem.isProtected,
        }}
      />
      <div className='content'>
        <Header chatListItem={chatListItem} />
        <Message chatListItem={chatListItem} />
      </div>
    </div>
  )
})

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

export const ChatListItemMessageResult = React.memo<{
  msr: MessageSearchResult
  onClick: () => void
  queryStr: string
}>(props => {
  const { msr, onClick, queryStr } = props
  if (typeof msr === 'undefined') return <PlaceholderChatListItem />
  return (
    <div role='button' onClick={onClick} className='pseudo-chat-list-item'>
      <Avatar
        avatarPath={msr.authorProfileImage}
        color={msr.author_color}
        displayName={msr.author_name}
      />
      <div className='content'>
        <div className='header'>
          <div className='name'>
            <span>
              {msr.author_name + (msr.chat_name ? ' in ' + msr.chat_name : '')}
            </span>
          </div>
          <div>
            <Timestamp
              timestamp={msr.timestamp * 1000}
              extended={false}
              module='timestamp'
            />
          </div>
        </div>
        <div className='chat-list-item-message'>
          <div className='text'>{rMessage(msr.message, queryStr)}</div>
        </div>
      </div>
    </div>
  )
})

const VISIBLE_MESSAGE_LENGTH = 50
const THRUNCATE_KEEP_LENGTH = 20

const rMessage = (msg: string, query: string) => {
  const pos_of_search_term = msg.toLowerCase().indexOf(query.toLowerCase())
  if (pos_of_search_term == -1) return msg
  let text = msg
  let pos_of_search_term_in_text = pos_of_search_term

  const truncate = pos_of_search_term > VISIBLE_MESSAGE_LENGTH

  //check if needs to be trimmed in order to be displayed
  if (truncate) {
    text = msg.slice(pos_of_search_term - THRUNCATE_KEEP_LENGTH)
    pos_of_search_term_in_text = THRUNCATE_KEEP_LENGTH
  }

  const before = text.slice(0, pos_of_search_term_in_text)
  const search_term = text.slice(
    pos_of_search_term_in_text,
    pos_of_search_term_in_text + query.length
  )
  const after = text.slice(pos_of_search_term_in_text + query.length)

  return (
    <div>
      {(truncate ? '...' : '') + before}
      <b>{search_term}</b>
      {after}
    </div>
  )
}
