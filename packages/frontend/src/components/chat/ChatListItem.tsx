import React, { useRef } from 'react'
import classNames from 'classnames'
import { T, C } from '@deltachat/jsonrpc-client'

import Timestamp from '../conversations/Timestamp'
import { Avatar } from '../Avatar'
import { Type, EffectfulBackendActions } from '../../backend-com'
import { mapCoreMsgStatus2String } from '../helpers/MapMsgStatus'
import { getLogger } from '../../../../shared/logger'
import { useContextMenuWithActiveState } from '../ContextMenu'
import { selectedAccountId } from '../../ScreenController'
import { InlineVerifiedIcon } from '../VerifiedIcon'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { message2React } from '../message/MessageMarkdown'
import { useRovingTabindex } from '../../contexts/RovingTabindex'

const log = getLogger('renderer/chatlist/item')

function FreshMessageCounter({ counter }: { counter: number }) {
  if (counter === 0) return null
  return <div className='fresh-message-counter'>{counter}</div>
}

type ChatListItemType = Type.ChatListItemFetchResult & {
  kind: 'ChatListItem'
}

function Header({
  lastUpdated,
  name,
  isPinned,
  isMuted,
  isProtected,
}: Pick<
  ChatListItemType,
  'lastUpdated' | 'name' | 'isPinned' | 'isMuted' | 'isProtected'
>) {
  const tx = window.static_translate
  return (
    <div className='header'>
      <div className='name'>
        <span>
          <span className='truncated'>{name}</span>
          {isProtected && <InlineVerifiedIcon />}
        </span>
      </div>
      {isMuted && <div className='mute_icon' aria-label={tx('mute')} />}
      <div>
        {lastUpdated && lastUpdated !== 0 && (
          <Timestamp
            timestamp={lastUpdated}
            extended={false}
            module='timestamp'
          />
        )}
      </div>
      {isPinned && <div className='pin_icon' aria-label={tx('pin')} />}
    </div>
  )
}

// `React.memo()` because `message2React` inside of it takes a while.
// Although we also `React.memo()` entire `ChatListItem`s,
// they are still re-rendered when their `isSelected` changes.
const Message = React.memo<
  Pick<
    ChatListItemType,
    | 'summaryStatus'
    | 'summaryText1'
    | 'summaryText2'
    | 'freshMessageCounter'
    | 'isArchived'
    | 'isContactRequest'
    | 'summaryPreviewImage'
    | `lastMessageId`
  >
>(function ({
  summaryStatus,
  summaryText1,
  summaryText2,
  freshMessageCounter,
  isArchived,
  isContactRequest,
  summaryPreviewImage,
  lastMessageId,
}) {
  const wasReceived =
    summaryStatus === C.DC_STATE_IN_FRESH ||
    summaryStatus === C.DC_STATE_IN_SEEN ||
    summaryStatus === C.DC_STATE_IN_NOTICED

  const status = wasReceived ? '' : mapCoreMsgStatus2String(summaryStatus)

  const iswebxdc = summaryPreviewImage === 'webxdc-icon://last-msg-id'

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
        {summaryPreviewImage && !iswebxdc && (
          <div
            className='summary_thumbnail'
            style={{
              backgroundImage: `url(${JSON.stringify(
                runtime.transformBlobURL(summaryPreviewImage)
              )})`,
            }}
          />
        )}
        {iswebxdc && lastMessageId && (
          <div
            className='summary_thumbnail'
            style={{
              backgroundImage: `url("${runtime.getWebxdcIconURL(
                selectedAccountId(),
                lastMessageId
              )}")`,
            }}
          />
        )}
        {message2React(summaryText2 || '', true, -1)}
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
})

export const PlaceholderChatListItem = React.memo(_ => {
  return <div className={classNames('chat-list-item', 'skeleton')} />
})

function ChatListItemArchiveLink({
  onClick,
  chatListItem,
}: {
  onClick: () => void
  chatListItem: Type.ChatListItemFetchResult & {
    kind: 'ArchiveLink'
  }
}) {
  const tx = window.static_translate
  const { onContextMenu, isContextMenuActive } = useContextMenuWithActiveState([
    {
      label: tx('mark_all_as_read'),
      action: () => {
        EffectfulBackendActions.marknoticedChat(
          selectedAccountId(),
          C.DC_CHAT_ID_ARCHIVED_LINK
        )
      },
    },
  ])

  const ref = useRef<HTMLButtonElement>(null)

  const {
    tabIndex,
    onKeydown: tabindexOnKeydown,
    setAsActiveElement: tabindexSetAsActiveElement,
    className: tabindexClassName,
  } = useRovingTabindex(ref)

  return (
    <button
      ref={ref}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={tabindexOnKeydown}
      onFocus={tabindexSetAsActiveElement}
      onContextMenu={onContextMenu}
      className={`chat-list-item archive-link-item ${tabindexClassName} ${
        isContextMenuActive ? 'context-menu-active' : ''
      }`}
    >
      <div className='avatar'>
        <img className='content' src='./images/icons/icon-archive.svg' />
      </div>
      <div className='content'>
        <div className='archive-link'>{tx('chat_archived_chats_title')}</div>
      </div>
      <FreshMessageCounter counter={chatListItem.freshMessageCounter} />
    </button>
  )
}

function ChatListItemError({
  chatListItem,
  onClick,
  isSelected,
  onContextMenu,
}: {
  chatListItem: Type.ChatListItemFetchResult & {
    kind: 'Error'
  }
  onClick: () => void
  onContextMenu?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void
  isSelected?: boolean
}) {
  log.info('Error Loading Chatlistitem ' + chatListItem.id, chatListItem.error)

  const ref = useRef<HTMLButtonElement>(null)

  const {
    tabIndex,
    onKeydown: tabindexOnKeydown,
    setAsActiveElement: tabindexSetAsActiveElement,
    className: tabindexClassName,
  } = useRovingTabindex(ref)

  return (
    <button
      ref={ref}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={tabindexOnKeydown}
      onFocus={tabindexSetAsActiveElement}
      onContextMenu={onContextMenu}
      className={classNames('chat-list-item', tabindexClassName, {
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
            {chatListItem.error}
          </div>
        </div>
      </div>
    </button>
  )
}

function ChatListItemNormal({
  chatListItem,
  onClick,
  isSelected,
  onContextMenu,
  isContextMenuActive,
  hover,
}: {
  chatListItem: Type.ChatListItemFetchResult & {
    kind: 'ChatListItem'
  }
  onClick: () => void
  onContextMenu?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void
  isContextMenuActive?: boolean
  isSelected?: boolean
  hover?: boolean
}) {
  const ref = useRef<HTMLButtonElement>(null)

  const {
    tabIndex,
    onKeydown: tabindexOnKeydown,
    setAsActiveElement: tabindexSetAsActiveElement,
    className: tabindexClassName,
  } = useRovingTabindex(ref)
  // TODO `setAsActiveElement` if `isSelected` and `activeElement === null`

  return (
    <button
      ref={ref}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={tabindexOnKeydown}
      onFocus={tabindexSetAsActiveElement}
      onContextMenu={onContextMenu}
      className={classNames('chat-list-item', tabindexClassName, {
        'has-unread': chatListItem.freshMessageCounter > 0,
        'is-contact-request': chatListItem.isContactRequest,
        pinned: chatListItem.isPinned,
        muted: chatListItem.isMuted,
        selected: isSelected,
        'context-menu-active': isContextMenuActive,
      })}
      style={hover ? { backgroundColor: 'var(--chatListItemBgHover)' } : {}}
    >
      <Avatar
        {...{
          displayName: chatListItem.name,
          avatarPath: chatListItem.avatarPath || undefined,
          color: chatListItem.color,
          wasSeenRecently: chatListItem.wasSeenRecently,
        }}
      />
      <div className='content'>
        <Header
          lastUpdated={chatListItem.lastUpdated}
          name={chatListItem.name}
          isProtected={chatListItem.isProtected}
          isPinned={chatListItem.isPinned}
          isMuted={chatListItem.isMuted}
        />

        <Message
          summaryStatus={chatListItem.summaryStatus}
          summaryText1={chatListItem.summaryText1}
          summaryText2={chatListItem.summaryText2}
          summaryPreviewImage={chatListItem.summaryPreviewImage}
          freshMessageCounter={chatListItem.freshMessageCounter}
          isArchived={chatListItem.isArchived}
          isContactRequest={chatListItem.isContactRequest}
          lastMessageId={chatListItem.lastMessageId}
        />
      </div>
    </button>
  )
}

type ChatListItemProps = {
  chatListItem: Type.ChatListItemFetchResult | undefined
  onClick: () => void
  onContextMenu?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void
  isContextMenuActive?: boolean
  isSelected?: boolean
  hover?: boolean
}

const ChatListItem = React.memo<ChatListItemProps>(
  props => {
    const { chatListItem, onClick, hover } = props

    // if not loaded by virtual list yet
    if (typeof chatListItem === 'undefined') return <PlaceholderChatListItem />

    if (chatListItem.kind == 'ChatListItem') {
      return (
        <ChatListItemNormal
          chatListItem={chatListItem}
          onClick={onClick}
          isSelected={props.isSelected}
          onContextMenu={props.onContextMenu}
          isContextMenuActive={props.isContextMenuActive}
          hover={hover}
        />
      )
    } else if (chatListItem.kind == 'Error') {
      return (
        <ChatListItemError
          chatListItem={chatListItem}
          onClick={onClick}
          isSelected={props.isSelected}
          onContextMenu={props.onContextMenu}
        />
      )
    } else if (chatListItem.kind == 'ArchiveLink') {
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
      prevProps.isSelected !== nextProps.isSelected ||
      prevProps.isContextMenuActive !== nextProps.isContextMenuActive
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

  const ref = useRef<HTMLButtonElement>(null)

  const {
    tabIndex,
    onKeydown: tabindexOnKeydown,
    setAsActiveElement: tabindexSetAsActiveElement,
    className: tabindexClassName,
  } = useRovingTabindex(ref)

  if (typeof msr === 'undefined') return <PlaceholderChatListItem />

  return (
    <button
      ref={ref}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={tabindexOnKeydown}
      onFocus={tabindexSetAsActiveElement}
      className={`pseudo-chat-list-item message-search-result ${tabindexClassName}`}
    >
      <div className='avatars'>
        <Avatar
          className='big'
          avatarPath={msr.chatProfileImage}
          color={msr.chatColor}
          displayName={msr.chatName}
        />
        {!(
          msr.chatType === C.DC_CHAT_TYPE_SINGLE &&
          msr.authorId !== C.DC_CONTACT_ID_SELF
        ) && (
          <Avatar
            className='small'
            avatarPath={msr.authorProfileImage}
            color={msr.authorColor}
            displayName={msr.authorName}
          />
        )}
      </div>
      <div className='content'>
        <div className='header'>
          <div className='name'>
            <span>
              <span className='truncated'>{msr.chatName}</span>
              {msr.isChatProtected && <InlineVerifiedIcon />}
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
        <div className='message-result-author-line'>
          <div className='author-name'>{msr.authorName}</div>
          {msr.isChatContactRequest && (
            <div className='label'>
              {window.static_translate('chat_request_label')}
            </div>
          )}
          {msr.isChatArchived && (
            <div className='label'>
              {window.static_translate('chat_archived_label')}
            </div>
          )}
        </div>
        <div className='chat-list-item-message'>
          <div className='text'>{rMessage(msr.message, queryStr)}</div>
        </div>
      </div>
    </button>
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
    <>
      {(truncate ? '...' : '') + before}
      <b>{search_term}</b>
      {after}
    </>
  )
}
