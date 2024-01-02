import {
  parse_desktop_set,
  parse_text,
} from '@deltachat/message_parser_wasm/message_parser_wasm'
import React, { useContext } from 'react'

import { LabeledLink, Link } from './Link'
import { getLogger } from '../../../shared/logger'
import { BackendRemote } from '../../backend-com'
import { MessagesDisplayContext } from '../../contexts/MessagesDisplayContext'
import useConfirmationDialog from '../../hooks/useConfirmationDialog'
import useDialog from '../../hooks/useDialog'
import { ActionEmitter, KeybindAction } from '../../keybindings'
import { selectedAccountId } from '../../ScreenController'
import { ChatView } from '../../stores/chat'
import SettingsStoreInstance from '../../stores/settings'
import {
  createChatByEmail,
  selectChat,
  setChatView,
} from '../helpers/ChatMethods'

import type { ParsedElement } from '@deltachat/message_parser_wasm/message_parser_wasm'

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
  const openConfirmationDialog = useConfirmationDialog()
  const messageDisplay = useContext(MessagesDisplayContext)
  const accountId = selectedAccountId()

  const applySuggestion = async () => {
    if (!messageDisplay) {
      return
    }

    let chatID
    if (messageDisplay.context == 'contact_profile_status') {
      // Bot command was clicked inside of a contact status
      chatID = await BackendRemote.rpc.createChatByContactId(
        accountId,
        messageDisplay.contact_id
      )
      // also select the chat and close the profile window if this is the case
      selectChat(chatID)
      messageDisplay.closeProfileDialog()
    } else if (messageDisplay.context == 'chat_map') {
      chatID = messageDisplay.chatId
      // go back to chat view
      selectChat(chatID)
      setChatView(ChatView.MessageList)
    } else if (messageDisplay.context == 'chat_messagelist') {
      // nothing special to do
      chatID = messageDisplay.chatId
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
      BackendRemote.rpc.getBasicChatInfo(accountId, chatID),
      BackendRemote.rpc.getDraft(accountId, chatID),
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
