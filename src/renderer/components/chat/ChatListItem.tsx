import React from 'react'
import classNames from 'classnames'
import Timestamp from '../conversations/Timestamp'
import MessageBody from '../message/MessageBody'
import { C } from '@deltachat/jsonrpc-client'
import { Avatar } from '../Avatar'
import { BackendRemote, Type } from '../../backend-com'
import { mapCoreMsgStatus2String } from '../helpers/MapMsgStatus'
import { T } from '@deltachat/jsonrpc-client'
import { getLogger } from '../../../shared/logger'
import { useContextMenu } from '../ContextMenu'
import { selectedAccountId } from '../../ScreenController'

const log = getLogger('renderer/chatlist/item')

function FreshMessageCounter({ counter }: { counter: number }) {
  if (counter === 0) return null
  return <div className='fresh-message-counter'>{counter}</div>
}

type ChatListItemType = Type.ChatListItemFetchResult & {
  type: 'ChatListItem'
}

function Header({
  lastUpdated,
  name,
  isPinned,
  isMuted,
}: Pick<ChatListItemType, 'lastUpdated' | 'name' | 'isPinned' | 'isMuted'>) {
  const tx = window.static_translate
  return (
    <div className='header'>
      <div className='name'>
        <span>{name + ' '}</span>
      </div>
      {isMuted && <div className='mute_icon' aria-label={tx('mute')} />}
      {isPinned && <div className='pin_icon' aria-label={tx('pin')} />}
      <div>
        {lastUpdated && lastUpdated !== 0 && (
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

function Message({
  summaryStatus,
  summaryText1,
  summaryText2,
  freshMessageCounter,
  isArchived,
  isContactRequest,
}: Pick<
  ChatListItemType,
  | 'summaryStatus'
  | 'summaryText1'
  | 'summaryText2'
  | 'freshMessageCounter'
  | 'isArchived'
  | 'isContactRequest'
>) {
  const wasReceived =
    summaryStatus === C.DC_STATE_IN_FRESH ||
    summaryStatus === C.DC_STATE_IN_SEEN ||
    summaryStatus === C.DC_STATE_IN_NOTICED

  const status = wasReceived ? '' : mapCoreMsgStatus2String(summaryStatus)

  return (
    <div className='chat-list-item-message'>
      <div className='text'>
        {summaryText1 && (
          <div
            className={classNames('summary', {
              draft: summaryStatus === C.DC_STATE_OUT_DRAFT,
            })}
          >
            {summaryText1 + ': '}
          </div>
        )}
        <MessageBody text={summaryText2 || ''} disableJumbomoji preview />
      </div>
      {isContactRequest && (
        <div className='label'>
          {window.static_translate('chat_request_label')}
        </div>
      )}
      {isArchived && (
        <div className='label'>
          {window.static_translate('chat_archived_label')}
        </div>
      )}
      {!isArchived && !isContactRequest && status && (
        <div className={classNames('status-icon', status)} />
      )}
      {!isContactRequest && (
        <FreshMessageCounter counter={freshMessageCounter} />
      )}
    </div>
  )
}

export const PlaceholderChatListItem = React.memo(_ => {
  return <div className={classNames('chat-list-item', 'skeleton')} />
})

function ChatListItemArchiveLink({
  onClick,
  chatListItem,
}: {
  onClick: () => void
  chatListItem: Type.ChatListItemFetchResult & {
    type: 'ArchiveLink'
  }
}) {
  const tx = window.static_translate

  const onContextMenu = useContextMenu([
    {
      label: tx('mark_all_as_read'),
      action: () => {
        BackendRemote.rpc.marknoticedChat(
          selectedAccountId(),
          C.DC_CHAT_ID_ARCHIVED_LINK
        )
      },
    },
  ])

  return (
    <div
      role='button'
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={'chat-list-item archive-link-item'}
    >
      <div className='avatar'>
        <img className='content' src='../images/icons/icon-archive.svg' />
      </div>
      <div className='content'>
        <div className='archive-link'>{tx('chat_archived_chats_title')}</div>
      </div>
      <FreshMessageCounter counter={chatListItem.freshMessageCounter} />
    </div>
  )
}

function ChatListItemError({
  chatListItem,
  onClick,
  isSelected,
  onContextMenu,
}: {
  chatListItem: Type.ChatListItemFetchResult & {
    type: 'Error'
  }
  onClick: () => void
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  isSelected?: boolean
}) {
  log.info('Error Loading Chatlistitem ' + chatListItem.id, chatListItem.error)
  return (
    <div
      role='button'
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={classNames('chat-list-item', {
        isError: true,
        selected: isSelected,
      })}
    >
      <Avatar
        {...{
          displayName: 'E',
          color: '',
        }}
      />
      <div className='content'>
        <div className='header'>
          <div className='name'>
            <span>Error Loading Chat {chatListItem.id}</span>
          </div>
        </div>
        <div className='chat-list-item-message'>
          <div className='text' title={chatListItem.error}>
            <MessageBody text={chatListItem.error} disableJumbomoji preview />
          </div>
        </div>
      </div>
    </div>
  )
}

function ChatListItemNormal({
  chatListItem,
  onClick,
  isSelected,
  onContextMenu,
}: {
  chatListItem: Type.ChatListItemFetchResult & {
    type: 'ChatListItem'
  }
  onClick: () => void
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  isSelected?: boolean
}) {
  return (
    <div
      role='button'
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={classNames('chat-list-item', {
        'has-unread': chatListItem.freshMessageCounter > 0,
        'is-contact-request': chatListItem.isContactRequest,
        pinned: chatListItem.isPinned,
        muted: chatListItem.isMuted,
        selected: isSelected,
      })}
    >
      <Avatar
        {...{
          displayName: chatListItem.name,
          avatarPath: chatListItem.avatarPath || undefined,
          color: chatListItem.color,
          isVerified: chatListItem.isProtected,
          wasSeenRecently: chatListItem.wasSeenRecently,
        }}
      />
      <div className='content'>
        <Header
          lastUpdated={chatListItem.lastUpdated}
          name={chatListItem.name}
          isPinned={chatListItem.isPinned}
          isMuted={chatListItem.isMuted}
        />
        <Message
          summaryStatus={chatListItem.summaryStatus}
          summaryText1={chatListItem.summaryText1}
          summaryText2={chatListItem.summaryText2}
          freshMessageCounter={chatListItem.freshMessageCounter}
          isArchived={chatListItem.isArchived}
          isContactRequest={chatListItem.isContactRequest}
        />
      </div>
    </div>
  )
}

type ChatListItemProps = {
  chatListItem: Type.ChatListItemFetchResult | undefined
  onClick: () => void
  onContextMenu?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
  isSelected?: boolean
}

const ChatListItem = React.memo<ChatListItemProps>(
  props => {
    const { chatListItem, onClick } = props

    // if not loaded by virtual list yet
    if (typeof chatListItem === 'undefined') return <PlaceholderChatListItem />

    if (chatListItem.type == 'ChatListItem') {
      return (
        <ChatListItemNormal
          chatListItem={chatListItem}
          onClick={onClick}
          isSelected={props.isSelected}
          onContextMenu={props.onContextMenu}
        />
      )
    } else if (chatListItem.type == 'Error') {
      return (
        <ChatListItemError
          chatListItem={chatListItem}
          onClick={onClick}
          isSelected={props.isSelected}
          onContextMenu={props.onContextMenu}
        />
      )
    } else if (chatListItem.type == 'ArchiveLink') {
      return (
        <ChatListItemArchiveLink
          chatListItem={chatListItem}
          onClick={onClick}
        />
      )
    } else {
      return <PlaceholderChatListItem />
    }
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
  msr: T.MessageSearchResult
  onClick: () => void
  queryStr: string
}>(props => {
  const { msr, onClick, queryStr } = props
  if (typeof msr === 'undefined') return <PlaceholderChatListItem />
  return (
    <div role='button' onClick={onClick} className='pseudo-chat-list-item'>
      <Avatar
        avatarPath={msr.authorProfileImage}
        color={msr.authorColor}
        displayName={msr.authorName}
      />
      <div className='content'>
        <div className='header'>
          <div className='name'>
            <span>
              {msr.authorName + (msr.chatName ? ' in ' + msr.chatName : '')}
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
