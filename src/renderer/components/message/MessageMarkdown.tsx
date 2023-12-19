import React, { useContext } from 'react'
import {
  parse_desktop_set,
  parse_text,
  ParsedElement,
} from '@deltachat/message_parser_wasm/message_parser_wasm'

import { LabeledLink, Link } from './Link'
import { getLogger } from '../../../shared/logger'
import { ActionEmitter, KeybindAction } from '../../keybindings'
import {
  createChatByEmail,
  selectChat,
  setChatView,
} from '../helpers/ChatMethods'
import { ChatView } from '../../stores/chat'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import SettingsStoreInstance from '../../stores/settings'
import { MessagesDisplayContext } from '../../contexts/MessagesDisplayContext'
import ConfirmationDialog from '../dialogs/ConfirmationDialog'
import useDialog from '../../hooks/useDialog'

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

function renderElement(elm: ParsedElement, key?: number): JSX.Element {
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
      return <s key={key}>{elm.c.map(renderElement)}</s>

    case 'Italics':
      return <i key={key}>{elm.c.map(renderElement)}</i>

    case 'Bold':
      return <b key={key}>{elm.c.map(renderElement)}</b>

    case 'Tag':
      return <TagLink key={key} tag={elm.c} />

    case 'Link': {
      const { destination } = elm.c
      return <Link destination={destination} key={key} />
    }

    case 'LabeledLink':
      return (
        <>
          <LabeledLink
            key={key}
            destination={elm.c.destination}
            label={<>{elm.c.label.map(renderElement)}</>}
          />{' '}
        </>
      )

    case 'EmailAddress': {
      const email = elm.c
      return <EmailLink key={key} email={email} />
    }

    case 'BotCommandSuggestion':
      return <BotCommandSuggestion key={key} suggestion={elm.c} />

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

export function message2React(message: string): JSX.Element {
  try {
    const elements = parseMessage(message)
    return <>{elements.map(renderElement)}</>
  } catch (error) {
    log.error('parseMessage failed:', { input: message, error })
    return <>{message}</>
  }
}

function EmailLink({ email }: { email: string }): JSX.Element {
  const { openDialog } = useDialog()

  const handleClick = async () => {
    const chatId = await createChatByEmail(openDialog, email)
    if (chatId) {
      selectChat(chatId)
    }
  }

  return (
    <a
      href={'#'}
      x-not-a-link='email'
      x-target-email={email}
      onClick={handleClick}
    >
      {email}
    </a>
  )
}

function TagLink({ tag }: { tag: string }) {
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
    <a href={'#'} x-not-a-link='tag' onClick={setSearch}>
      {tag}
    </a>
  )
}

function BotCommandSuggestion({ suggestion }: { suggestion: string }) {
  const { openDialog } = useDialog()
  const message_display_context = useContext(MessagesDisplayContext)

  const applySuggestion = async () => {
    if (!message_display_context) {
      return
    }
    const accountId = selectedAccountId()

    let chatID
    if (message_display_context.context == 'contact_profile_status') {
      // Bot command was clicked inside of a contact status
      chatID = await BackendRemote.rpc.createChatByContactId(
        accountId,
        message_display_context.contact_id
      )
      // also select the chat and close the profile window if this is the case
      selectChat(chatID)
      message_display_context.closeProfileDialog()
    } else if (message_display_context.context == 'chat_map') {
      chatID = message_display_context.chatId
      // go back to chat view
      selectChat(chatID)
      setChatView(ChatView.MessageList)
    } else if (message_display_context.context == 'chat_messagelist') {
      // nothing special to do
      chatID = message_display_context.chatId
    } else {
      log.error(
        'Error applying BotCommandSuggestion: message_display_context.type is not implemented: ',
        //@ts-ignore
        message_display_context.type
      )
      return
    }
    // IDEA: Optimisation - unify these two calls in a new backend call that only returns the info we need
    const [chat, draft] = await Promise.all([
      BackendRemote.rpc.getBasicChatInfo(accountId, chatID),
      BackendRemote.rpc.getDraft(accountId, chatID),
    ])
    if (!chat) {
      log.error('chat not defined')
      return
    }
    const { name } = chat

    if (draft) {
      // ask if the draft should be replaced
      const continue_process = await new Promise((resolve, _reject) => {
        openDialog(ConfirmationDialog, {
          message: window.static_translate('confirm_replace_draft', name),
          confirmLabel: window.static_translate('replace_draft'),
          cb: resolve,
        })
      })
      if (!continue_process) {
        return
      }
    }

    await BackendRemote.rpc.miscSetDraft(
      accountId,
      chatID,
      suggestion,
      null,
      null,
      'Text'
    )

    window.__reloadDraft && window.__reloadDraft()
  }

  return (
    <a href='#' x-not-a-link='bcs' onClick={applySuggestion}>
      {suggestion}
    </a>
  )
}
