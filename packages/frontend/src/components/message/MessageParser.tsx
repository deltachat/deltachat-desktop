import React, { useContext } from 'react'

import type * as linkify from 'linkifyjs'
import 'linkify-plugin-hashtag'
import '../../utils/linkify/plugin-bot-command/index.js'

import { Link } from './Link.js'
import { parseElements } from '../../utils/linkify/parseElements.js'
import { getLinkDestination } from '../../utils/linkify/getLinkDestination.js'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { ActionEmitter, KeybindAction } from '../../keybindings'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { MessagesDisplayContext } from '../../contexts/MessagesDisplayContext'
import useChat from '../../hooks/chat/useChat'
import useCreateChatByEmail from '../../hooks/chat/useCreateChatByEmail'
import useDialog from '../../hooks/dialog/useDialog'

const log = getLogger('renderer/message-parser')

function renderElement(
  elm: linkify.MultiToken,
  tabindexForInteractiveContents: -1 | 0,
  key?: number
): React.ReactElement {
  switch (elm.t) {
    case 'hashtag':
      return (
        <TagLink
          key={key}
          tag={elm.v}
          tabIndex={tabindexForInteractiveContents}
        />
      )

    case 'url': {
      const destination = getLinkDestination(elm)
      if (destination == null) {
        log.error('cannot render invalid URL as a link', elm.v)
        // Should not really happen. Fall back to regular text.
        return <span key={key}>{elm.v}</span>
      }
      return (
        <Link
          destination={destination}
          key={key}
          tabIndex={tabindexForInteractiveContents}
        />
      )
    }

    case 'email': {
      const email = elm.v
      return (
        <EmailLink
          key={key}
          email={email}
          tabIndex={tabindexForInteractiveContents}
        />
      )
    }

    case 'botcommand':
      return (
        <BotCommandSuggestion
          key={key}
          suggestion={elm.v}
          tabIndex={tabindexForInteractiveContents}
        />
      )

    case 'nl':
      return <span key={key}>{'\n'}</span>

    case 'text':
      return <span key={key}>{elm.v}</span>
    default:
      log.error(`type ${elm.t} not known/implemented yet`, elm)
      return (
        <span key={key} style={{ color: 'red' }}>
          {elm.v}
        </span>
      )
  }
}

/**
 * parse message text (for links and interactive elements)
 * and render as React elements
 *
 * @param preview - render in preview mode for ChatListItem summary
 * and for quoted messages, without interactive elements
 * (links can not be clicked etc.)
 */
export function parseAndRenderMessage(
  message: string,
  preview: boolean,
  /**
   * Has no effect if `{@link preview} === true`, because there should be
   * no interactive elements in the first place
   */
  tabindexForInteractiveContents: -1 | 0
): React.ReactElement {
  if (preview) {
    return <div className='truncated'>{message}</div>
  }
  try {
    const elements = parseElements(message)
    return (
      <>
        {elements.map((el, index) =>
          renderElement(el, tabindexForInteractiveContents, index)
        )}
      </>
    )
  } catch (error) {
    log.error('parseAndRenderMessage failed:', { input: message, error })
    return <>{message}</>
  }
}

function EmailLink({
  email,
  tabIndex,
}: {
  email: string
  tabIndex: -1 | 0
}): React.ReactElement {
  const accountId = selectedAccountId()
  const createChatByEmail = useCreateChatByEmail()
  const { selectChat } = useChat()
  const { closeAllDialogs } = useDialog()

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = async ev => {
    ev.preventDefault()
    ev.stopPropagation()
    const chatId = await createChatByEmail(accountId, email)
    if (chatId) {
      selectChat(accountId, chatId)
      closeAllDialogs()
    }
  }

  return (
    <a
      href={`mailto:${email}`}
      x-not-a-link='email'
      x-target-email={email}
      onClick={handleClick}
      tabIndex={tabIndex}
    >
      {email}
    </a>
  )
}

function TagLink({ tag, tabIndex }: { tag: string; tabIndex: -1 | 0 }) {
  const setSearch = () => {
    log.debug(
      `Clicked on a hashtag, this should open search for the text "${tag}"`
    )
    if (window.__chatlistSetSearch) {
      window.__chatlistSetSearch(tag, null)
      ActionEmitter.emitAction(KeybindAction.ChatList_FocusSearchInput)
    }
  }

  return (
    <a href={'#'} x-not-a-link='tag' onClick={setSearch} tabIndex={tabIndex}>
      {tag}
    </a>
  )
}

function BotCommandSuggestion({
  suggestion,
  tabIndex,
}: {
  suggestion: string
  tabIndex: -1 | 0
}) {
  const messageDisplay = useContext(MessagesDisplayContext)
  const accountId = selectedAccountId()
  const { selectChat } = useChat()

  const applySuggestion = async () => {
    if (!messageDisplay) {
      return
    }

    let chatId
    if (messageDisplay.context == 'contact_profile_status') {
      // Bot command was clicked inside of a contact status
      chatId = await BackendRemote.rpc.createChatByContactId(
        accountId,
        messageDisplay.contact_id
      )
      // also select the chat and close the profile window if this is the case
      selectChat(accountId, chatId)
      messageDisplay.closeProfileDialog()
    } else if (messageDisplay.context == 'chat_messagelist') {
      // nothing special to do
      chatId = messageDisplay.chatId
    } else {
      log.error(
        'Error applying BotCommandSuggestion: MessageDisplayContext.type is not implemented: ',
        //@ts-ignore
        messageDisplay.type
      )
      return
    }

    // Copy-pasted from `useCreateDraftMesssage`.
    if (window.__setDraftRequest != undefined) {
      log.error('previous BotCommandSuggestion has not worked?')
    }
    window.__setDraftRequest = {
      accountId,
      chatId,
      text: suggestion,
    }
    window.__checkSetDraftRequest?.()
  }

  return (
    <a
      href='#'
      x-not-a-link='bcs'
      onClick={applySuggestion}
      tabIndex={tabIndex}
    >
      {suggestion}
    </a>
  )
}
