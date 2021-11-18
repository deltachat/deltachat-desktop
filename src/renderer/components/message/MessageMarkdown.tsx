import React, { useContext } from 'react'
import { LabeledLink, Link } from './Link'
import {
  parse_desktop_set,
  ParsedElement,
} from '@deltachat/message_parser_wasm/message_parser_wasm'
import { getLogger } from '../../../shared/logger'
import { DeltaBackend } from '../../delta-remote'
import { selectChat } from '../../stores/chat'
import { ActionEmitter, KeybindAction } from '../../keybindings'
import { MessagesDisplayContext } from '../../contexts'
import { View as MainScreenView } from '../screens/MainScreen'

const log = getLogger('renderer/message-markdown')

const parseMessage: (message: string) => ParsedElement[] = m =>
  parse_desktop_set(m)

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
      return <div key={key} className='line-break' />

    case 'Text':
      return <span key={key}>{elm.c}</span>
    default:
      //@ts-ignore
      log.error(`type ${elm.t} not known/implemented yet`, elm)
      return <span key={key} style={{ color: 'red' }}>{JSON.stringify(elm)}</span>
  }
}

export function message2React(message: string): JSX.Element {
  const elements = parseMessage(message)
  return <>{elements.map(renderElement)}</>
}

function EmailLink({ email }: { email: string }): JSX.Element {
  const openChatWithEmail = async () => {
    let contactId = await DeltaBackend.call(
      'contacts.lookupContactIdByAddr',
      email
    )
    if (contactId == 0) {
      contactId = await DeltaBackend.call('contacts.createContact', email)
    }
    const chatId = await DeltaBackend.call(
      'contacts.createChatByContactId',
      contactId
    )
    selectChat(chatId)
  }

  return (
    <a href={'#'} onClick={openChatWithEmail}>
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
      window.__chatlistSetSearch(tag)
      ActionEmitter.emitAction(KeybindAction.ChatList_FocusSearchInput)
      // TODO: If you wonder why the focus doesn't work - its because of jikstra's composer focus hacks
      // Which transfer the focus back to the composer instantly
    }
  }

  return (
    <a href={'#'} onClick={setSearch}>
      {tag}
    </a>
  )
}

function BotCommandSuggestion({ suggestion }: { suggestion: string }) {
  const message_display_context = useContext(MessagesDisplayContext)
  const applySuggestion = async () => {
    if (!message_display_context) {
      return
    }

    let chatID
    if (message_display_context.context == 'contact_profile_status') {
      // Bot command was clicked inside of a contact status
      chatID = await DeltaBackend.call(
        'contacts.createChatByContactId',
        message_display_context.contact_id
      )
      // also select the chat and close the profile window if this is the case
      selectChat(chatID)
      message_display_context.closeProfileDialog()
    } else if (message_display_context.context == 'chat_map') {
      chatID = message_display_context.chatId
      // go back to chat view
      selectChat(chatID)
      window.__setMainScreenView &&
        window.__setMainScreenView(MainScreenView.MessageList)
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
    const [{ name }, draft] = await Promise.all([
      DeltaBackend.call('chatList.getFullChatById', chatID),
      DeltaBackend.call('messageList.getDraft', chatID),
    ])

    if (draft) {
      // ask if the draft should be replaced
      const continue_process = await new Promise((resolve, _reject) => {
        window.__openDialog('ConfirmationDialog', {
          message: window.static_translate(
            'mailto_dialog_confirm_replace_draft',
            name
          ),
          confirmLabel: window.static_translate('replace_draft'),
          cb: resolve,
        })
      })
      if (!continue_process) {
        return
      }
    }

    await DeltaBackend.call('messageList.setDraft', chatID, {
      text: suggestion,
    })

    window.__reloadDraft && window.__reloadDraft()
  }

  return (
    <a href='#' onClick={applySuggestion}>
      {suggestion}
    </a>
  )
}
