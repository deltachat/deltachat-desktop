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
import { runtime } from '@deltachat-desktop/runtime-interface'
import { message2React } from '../message/MessageMarkdown'
import { useRovingTabindex } from '../../contexts/RovingTabindex'
import useTranslationFunction from '../../hooks/useTranslationFunction'

const log = getLogger('renderer/chatlist/item')

function FreshMessageCounter({ counter }: { counter: number }) {
  const tx = useTranslationFunction()

  if (counter === 0) return null
  return (
    <span
      className='fresh-message-counter'
      aria-label={tx('chat_n_new_messages', String(counter), {
        quantity: counter,
      })}
    >
      {counter}
    </span>
  )
}

type ChatListItemType = Type.ChatListItemFetchResult & {
  kind: 'ChatListItem'
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
        <span>
          <span className='truncated'>{name}</span>
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
  const isIncoming =
    summaryStatus === C.DC_STATE_IN_FRESH ||
    summaryStatus === C.DC_STATE_IN_SEEN ||
    summaryStatus === C.DC_STATE_IN_NOTICED

  const status = isIncoming ? '' : mapCoreMsgStatus2String(summaryStatus)

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
  roleTab,
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
  roleTab?: boolean
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
      role={roleTab ? 'tab' : undefined}
      aria-selected={isSelected}
      className={classNames('chat-list-item', tabindexClassName, {
        isError: true,
        selected: isSelected,
      })}
    >
      <Avatar
        {...{
          displayName: 'E',
          color: '',
          'aria-hidden': true,
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
  roleTab,
  onContextMenu,
  isContextMenuActive,
}: {
  chatListItem: Type.ChatListItemFetchResult & {
    kind: 'ChatListItem'
  }
  onClick: () => void
  onContextMenu?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void
  isContextMenuActive?: boolean
  roleTab?: boolean
  isSelected?: boolean
}) {
  const ref = useRef<HTMLButtonElement>(null)

  const {
    tabIndex,
    onKeydown: tabindexOnKeydown,
    setAsActiveElement: tabindexSetAsActiveElement,
    className: tabindexClassName,
  } = useRovingTabindex(ref)
  // TODO `setAsActiveElement` if `isSelected` and `activeElement === null`

  const chatTypeForTests = chatListItem.isSelfTalk
    ? 'self-talk'
    : chatListItem.isDeviceTalk
      ? 'device-talk'
      : chatListItem.id

  return (
    <button
      ref={ref}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={tabindexOnKeydown}
      onFocus={tabindexSetAsActiveElement}
      onContextMenu={onContextMenu}
      role={roleTab ? 'tab' : undefined}
      aria-selected={isSelected}
      className={classNames('chat-list-item', tabindexClassName, {
        'has-unread': chatListItem.freshMessageCounter > 0,
        'is-contact-request': chatListItem.isContactRequest,
        pinned: chatListItem.isPinned,
        muted: chatListItem.isMuted,
        selected: isSelected,
        'context-menu-active': isContextMenuActive,
      })}
      data-testid={`chat${chatListItem.isGroup ? '-group' : ''}-${chatTypeForTests}`}
    >
      <Avatar
        {...{
          displayName: chatListItem.name,
          avatarPath: chatListItem.avatarPath || undefined,
          color: chatListItem.color,
          wasSeenRecently: chatListItem.wasSeenRecently,
          // Avatar is purely decorative here,
          // and is redundant accessibility-wise,
          // because we display the chat name below.
          'aria-hidden': true,
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
  /**
   * Whether to set `role='tab'` on the item.
   *
   * Note that this doesn't apply to some items,
   * such as `ChatListItemArchiveLink`.
   */
  roleTab?: boolean
  isSelected?: boolean
}

const ChatListItem = React.memo<ChatListItemProps>(props => {
  const { chatListItem, onClick, roleTab } = props

  // if not loaded by virtual list yet
  if (typeof chatListItem === 'undefined') return <PlaceholderChatListItem />

  if (chatListItem.kind == 'ChatListItem') {
    return (
      <ChatListItemNormal
        chatListItem={chatListItem}
        onClick={onClick}
        roleTab={roleTab}
        isSelected={props.isSelected}
        onContextMenu={props.onContextMenu}
        isContextMenuActive={props.isContextMenuActive}
      />
    )
  } else if (chatListItem.kind == 'Error') {
    return (
      <ChatListItemError
        chatListItem={chatListItem}
        onClick={onClick}
        roleTab={roleTab}
        isSelected={props.isSelected}
        onContextMenu={props.onContextMenu}
      />
    )
  } else if (chatListItem.kind == 'ArchiveLink') {
    return (
      <ChatListItemArchiveLink chatListItem={chatListItem} onClick={onClick} />
    )
  } else {
    return <PlaceholderChatListItem />
  }
})

export default ChatListItem

export const ChatListItemMessageResult = React.memo<{
  msr: T.MessageSearchResult
  onClick: () => void
  queryStr: string
  /**
   * Whether the user is searching for messages in just a single chat.
   */
  isSingleChatSearch: boolean
}>(props => {
  const {
    msr,
    onClick,
    queryStr,
    /**
     * When the user is searching for messages in just a single chat,
     * we don't need to specify here which chat it belongs to.
     */
    isSingleChatSearch,
  } = props

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
      {/* Avatars are purely decorative here, and are redundant
      accessibility-wise, because we display the chat and author name below. */}
      <div className='avatars' aria-hidden='true'>
        {!isSingleChatSearch ? (
          <>
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
          </>
        ) : (
          <Avatar
            className='big'
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
              <span className='truncated'>
                {!isSingleChatSearch ? msr.chatName : msr.authorName}
              </span>
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
        {!isSingleChatSearch && (
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
        )}
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
