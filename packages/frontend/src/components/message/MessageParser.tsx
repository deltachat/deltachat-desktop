import React, { useContext, useMemo } from 'react'
import Markdown from 'react-markdown'
import type { Components } from 'react-markdown'

import * as linkify from 'linkifyjs'
import 'linkify-plugin-hashtag'
import '../../utils/linkify/plugin-bot-command/index.js'

import { Link } from './Link.js'
import { parseElements } from '../../utils/linkify/parseElements.js'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { ActionEmitter, KeybindAction } from '../../keybindings'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import { MessagesDisplayContext } from '../../contexts/MessagesDisplayContext'
import useChat from '../../hooks/chat/useChat'
import useCreateChatByEmail from '../../hooks/chat/useCreateChatByEmail'

const log = getLogger('renderer/message-parser')

const ALLOWED_LINK_SCHEMES = ['http', 'https']

/**
 * Build a link destination object with punycode detection for security.
 * Detects IDN homograph attacks by comparing the original URL with the parsed URL.
 */
function buildLinkDestination(fullUrl: string, linkText: string) {
  try {
    const url = new URL(fullUrl)
    const scheme = url.protocol.replace(':', '')
    if (!ALLOWED_LINK_SCHEMES.includes(scheme)) {
      return null
    }
    let suspicousUrl = false
    const stripLastSlash = (url: string) => {
      if (url.endsWith('/')) {
        url = url.slice(0, -1)
      }
      return url
    }
    // according to https://developer.mozilla.org/docs/Web/API/URL/hostname
    // domain names will be transformed to punycode automatically
    // so we just need to check if the original hostname is different
    // from the punycode one
    if (stripLastSlash(url.href) !== stripLastSlash(fullUrl)) {
      suspicousUrl = true
    }
    const destination = {
      target: fullUrl,
      hostname: url.hostname,
      punycode: suspicousUrl
        ? {
          ascii_hostname: url.hostname,
          punycode_encoded_url: url.href,
          original_hostname_or_full_url: linkText,
        }
        : null,
      scheme,
      linkText,
    }
    return destination
  } catch {
    log.warn('buildLinkDestination: invalid URL', fullUrl)
    return null
  }
}

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

    /**
     * linkifyJS does even identify URLs without scheme as URL, e.g.
     * "www.example.com" or "example.com/test" or "example.com?param=value" etc.
     * It does only identify valid TLDs based on https://data.iana.org/TLD/tlds-alpha-by-domain.txt
     */
    case 'url': {
      let fullUrl = elm.v
      // no token for scheme?
      if (!elm.tk.find(t => ['SLASH_SCHEME', 'SCHEME'].includes(t.t))) {
        // no scheme so we add https as default
        // be aware that custom protocols may not
        // have a SLASH_SCHEME but just a SCHEME
        // see https://github.com/nfrasser/linkifyjs/blob/3abe9abbcb4e069aeadde2f42de7dfcc2371c0f0/packages/linkifyjs/src/text.mjs#L24
        fullUrl = 'https://' + fullUrl
      }
      const destination = buildLinkDestination(fullUrl, elm.v)
      if (!destination) {
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
 * Process text children through existing parseElements() for hashtags/emails/bot commands/URLs.
 * This ensures that linkify detection (emails, hashtags, bot commands, URLs without markdown syntax)
 * still works within markdown-rendered text.
 */
function processTextChildren(
  children: React.ReactNode,
  tabIndex: -1 | 0,
  nonInteractiveContent: boolean
): React.ReactNode {
  if (nonInteractiveContent) {
    // Skip linkify processing for non-interactive content
    return children
  }
  return React.Children.map(children, (child, index) => {
    if (typeof child === 'string') {
      const elements = parseElements(child)
      return elements.map((el, i) =>
        renderElement(el, tabIndex, index * 1000 + i)
      )
    }
    return child
  })
}

/** Only these elements are allowed in markdown rendering. */
const MARKDOWN_ALLOWED_ELEMENTS = [
  'p',
  'a',
  'strong',
  'em',
  'code',
  'pre',
  'blockquote',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'br',
]

/**
 * Create custom markdown components for react-markdown.
 * These integrate with Delta Chat's existing link handling and linkify detection.
 */
function createMarkdownComponents(
  tabIndex: -1 | 0,
  nonInteractiveContent: boolean
): Components {
  return {
    // Override link rendering to use existing Link component
    a: ({ href, children }) => {
      // Extract text content from children for display
      const linkText =
        typeof children === 'string'
          ? children
          : React.Children.toArray(children)
            .map(child => (typeof child === 'string' ? child : ''))
            .join('')

      if (nonInteractiveContent) {
        // Render as plain text for non-interactive content (e.g., quoted messages)
        return <>{linkText}</>
      }

      const destination = buildLinkDestination(
        href || '',
        linkText || href || ''
      )
      if (!destination) {
        return <>{linkText}</>
      }

      return <Link destination={destination} tabIndex={tabIndex} />
    },

    // Process text children through linkify for hashtags/emails/bot commands
    p: ({ children }) => (
      <p>{processTextChildren(children, tabIndex, nonInteractiveContent)}</p>
    ),
    li: ({ children }) => (
      <li>{processTextChildren(children, tabIndex, nonInteractiveContent)}</li>
    ),
    em: ({ children }) => (
      <em>{processTextChildren(children, tabIndex, nonInteractiveContent)}</em>
    ),
    strong: ({ children }) => (
      <strong>
        {processTextChildren(children, tabIndex, nonInteractiveContent)}
      </strong>
    ),

    // Code blocks and inline code - no linkify processing needed
    code: ({ children }) => {
      return <code>{children}</code>
    },
    pre: ({ children }) => <pre>{children}</pre>,
  }
}

/**
 * Render message text with markdown support.
 */
function MarkdownMessage({
  text,
  tabIndex,
  nonInteractiveContent,
}: {
  text: string
  tabIndex: -1 | 0
  nonInteractiveContent: boolean
}) {
  const components = useMemo(
    () => createMarkdownComponents(tabIndex, nonInteractiveContent),
    [tabIndex, nonInteractiveContent]
  )
  return (
    <Markdown
      className='markdown-content'
      components={components}
      allowedElements={MARKDOWN_ALLOWED_ELEMENTS}
    >
      {text}
    </Markdown>
  )
}

/**
 * parse message text (for links and interactive elements)
 * and render as React elements
 *
 * @param preview - render in preview mode for ChatListItem summary
 * and for quoted messages, without interactive elements
 * (links can not be clicked etc.)
 * @param enableMarkdown - render markdown formatting
 */
export function parseAndRenderMessage(
  message: string,
  preview: boolean,
  /**
   * Has no effect if `{@link preview} === true`, because there should be
   * no interactive elements in the first place
   */
  tabindexForInteractiveContents: -1 | 0,
  enableMarkdown: boolean,
): React.ReactElement {
  if (enableMarkdown) {
    return (
      <MarkdownMessage
        text={message}
        tabIndex={tabindexForInteractiveContents}
        nonInteractiveContent={preview}
      />
    )
  }

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

  const handleClick: React.MouseEventHandler<HTMLAnchorElement> = async ev => {
    ev.preventDefault()
    ev.stopPropagation()
    const chatId = await createChatByEmail(accountId, email)
    if (chatId) {
      selectChat(accountId, chatId)
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
