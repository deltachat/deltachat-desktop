import React, { useContext } from 'react'
import {
  parse_desktop_set,
  parse_text,
  ParsedElement,
} from '@deltachat/message_parser_wasm/message_parser_wasm'

import { LabeledLink, Link } from './Link'
import { getLogger } from '../../../../shared/logger'
import { ActionEmitter, KeybindAction } from '../../keybindings'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import SettingsStoreInstance from '../../stores/settings'
import { MessagesDisplayContext } from '../../contexts/MessagesDisplayContext'
import useChat from '../../hooks/chat/useChat'
import useConfirmationDialog from '../../hooks/dialog/useConfirmationDialog'
import useCreateChatByEmail from '../../hooks/chat/useCreateChatByEmail'
import { ChatView } from '../../contexts/ChatContext'

const log = getLogger('renderer/message-markdown')

let parseMessage: (message: string) => ParsedElement[] = m =>
  parse_desktop_set(m)

SettingsStoreInstance.subscribe(newState => {
  if (newState?.desktopSettings.experimentalEnableMarkdownInMessages) {
    parseMessage = m => parse_text(m, true)
  } else {
    parseMessage = m => parse_desktop_set(m)
  }
})

function renderElement(
  elm: ParsedElement,
  tabindexForInteractiveContents: -1 | 0,
  key?: number
): JSX.Element {
  const mapFn = (elm: ParsedElement, index: number) =>
    renderElement(elm, tabindexForInteractiveContents, index)
  switch (elm.t) {
    case 'CodeBlock':
      return (
        <code className={'mm-code mm-code-' + elm.c.language} key={key}>
          {elm.c.language && <span>{elm.c.language}</span>}
          {elm.c.content}
        </code>
      )

    case 'InlineCode':
      return (
        <code className='mm-inline-code' key={key}>
          {elm.c.content}
        </code>
      )

    case 'StrikeThrough':
      return <s key={key}>{elm.c.map(mapFn)}</s>

    case 'Italics':
      return <i key={key}>{elm.c.map(mapFn)}</i>

    case 'Bold':
      return <b key={key}>{elm.c.map(mapFn)}</b>

    case 'Tag':
      return (
        <TagLink
          key={key}
          tag={elm.c}
          tabIndex={tabindexForInteractiveContents}
        />
      )

    case 'Link': {
      const { destination } = elm.c
      return (
        <Link
          destination={destination}
          key={key}
          tabIndex={tabindexForInteractiveContents}
        />
      )
    }

    case 'LabeledLink':
      return (
        <span key={key}>
          <LabeledLink
            destination={elm.c.destination}
            label={<>{elm.c.label.map(mapFn)}</>}
            tabIndex={tabindexForInteractiveContents}
          />{' '}
        </span>
      )

    case 'EmailAddress': {
      const email = elm.c
      return (
        <EmailLink
          key={key}
          email={email}
          tabIndex={tabindexForInteractiveContents}
        />
      )
    }

    case 'BotCommandSuggestion':
      return (
        <BotCommandSuggestion
          key={key}
          suggestion={elm.c}
          tabIndex={tabindexForInteractiveContents}
        />
      )

    case 'Linebreak':
      return <span key={key}>{'\n'}</span>

    case 'Text':
      return <span key={key}>{elm.c}</span>
    default:
      //@ts-ignore
      log.error(`type ${elm.t} not known/implemented yet`, elm)
      return (
        <span key={key} style={{ color: 'red' }}>
          {JSON.stringify(elm)}
        </span>
      )
  }
}

/** render in preview mode for ChatListItem summary and for quoted messages,
 *  not interactive (links can not be clicked) just looks more similar to the message in the chatview/message-list */
function renderElementPreview(elm: ParsedElement, key?: number): JSX.Element {
  switch (elm.t) {
    case 'CodeBlock':
    case 'InlineCode':
      return (
        <code className='mm-inline-code' key={key}>
          {elm.c.content}
        </code>
      )

    case 'StrikeThrough':
      return <s key={key}>{elm.c.map(renderElementPreview)}</s>

    case 'Italics':
      return <i key={key}>{elm.c.map(renderElementPreview)}</i>

    case 'Bold':
      return <b key={key}>{elm.c.map(renderElementPreview)}</b>

    case 'Link':
      return <span key={key}>{elm.c.destination.target}</span>

    case 'LabeledLink':
      return <span key={key}>{elm.c.label.map(renderElementPreview)} </span>

    case 'Linebreak':
      return <span key={key}>{''}</span>

    case 'Tag':
    case 'EmailAddress':
    case 'BotCommandSuggestion':
    case 'Text':
      return <span key={key}>{elm.c}</span>
    default:
      //@ts-ignore
      log.error(`type ${elm.t} not known/implemented yet`, elm)
      return (
        <div key={key} style={{ color: 'red' }}>
          {JSON.stringify(elm)}
        </div>
      )
  }
}

export function message2React(
  message: string,
  preview: boolean,
  /**
   * Has no effect `{@link preview} === true`, because there should be
   * no interactive elements in the first place
   */
  tabindexForInteractiveContents: -1 | 0
): JSX.Element {
  try {
    const elements = parseMessage(message)
    return preview ? (
      <div className='truncated'>{elements.map(renderElementPreview)}</div>
    ) : (
      <>
        {elements.map((el, index) =>
          renderElement(el, tabindexForInteractiveContents, index)
        )}
      </>
    )
  } catch (error) {
    log.error('parseMessage failed:', { input: message, error })
    return <>{message}</>
  }
}

function EmailLink({
  email,
  tabIndex,
}: {
  email: string
  tabIndex: -1 | 0
}): JSX.Element {
  const accountId = selectedAccountId()
  const createChatByEmail = useCreateChatByEmail()
  const { selectChat } = useChat()

  const handleClick = async () => {
    const chatId = await createChatByEmail(accountId, email)
    if (chatId) {
      selectChat(accountId, chatId)
    }
  }

  return (
    <a
      href={'#'}
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
      `Clicked on a hastag, this should open search for the text "${tag}"`
    )
    if (window.__chatlistSetSearch) {
      window.__chatlistSetSearch(tag, null)
      ActionEmitter.emitAction(KeybindAction.ChatList_FocusSearchInput)
      // TODO: If you wonder why the focus doesn't work - its because of jikstra's composer focus hacks
      // Which transfer the focus back to the composer instantly
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
  const openConfirmationDialog = useConfirmationDialog()
  const messageDisplay = useContext(MessagesDisplayContext)
  const accountId = selectedAccountId()
  const { selectChat, setChatView } = useChat()

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
    } else if (messageDisplay.context == 'chat_map') {
      chatId = messageDisplay.chatId
      // go back to chat view
      selectChat(accountId, chatId)
      setChatView(ChatView.MessageList)
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

    // IDEA: Optimisation - unify these two calls in a new backend call that only returns the info we need
    const [chat, draft] = await Promise.all([
      BackendRemote.rpc.getBasicChatInfo(accountId, chatId),
      BackendRemote.rpc.getDraft(accountId, chatId),
    ])

    if (!chat) {
      log.error('chat not defined')
      return
    }

    const { name } = chat

    if (draft) {
      // Ask if the draft should be replaced
      const confirmed = openConfirmationDialog({
        message: window.static_translate('confirm_replace_draft', name),
        confirmLabel: window.static_translate('replace_draft'),
      })

      if (!confirmed) {
        return
      }
    }

    await BackendRemote.rpc.miscSetDraft(
      accountId,
      chatId,
      suggestion,
      null,
      null,
      'Text'
    )

    window.__reloadDraft && window.__reloadDraft()
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
