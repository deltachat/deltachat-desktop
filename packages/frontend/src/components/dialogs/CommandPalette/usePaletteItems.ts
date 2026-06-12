import { useEffect, useRef, useState } from 'react'
import { getLogger } from '@deltachat-desktop/shared/logger'

import { BackendRemote } from '../../../backend-com'
import { getConfiguredAccounts } from '../../../backend/account'
import moment from 'moment'
import type { PaletteItem, PaletteScope } from './types'

const log = getLogger('renderer/CommandPalette')

/** How many results to show per section. */
const MAX_PER_SECTION = {
  accounts: 16, // accounts never appear in multi section results
  chats: 8,
  contacts: 5,
  messages: 8,
}

/**
 * Possible navigation actions the items call when selected.
 */
export type PaletteActions = {
  selectChat: (accountId: number, chatId: number) => void
  jumpToMessage: (accountId: number, chatId: number, msgId: number) => void
  createChatByContactId: (accountId: number, contactId: number) => Promise<void>
  switchAccount: (accountId: number) => Promise<void>
  close: () => void
}

export type UsePaletteItemsParams = {
  accountId: number
  /**
   * Scope for the current query, which determines what is shown in the list:
   * - `root`: list other accounts to switch to (the only place accounts show).
   * - `account`: search chats, contacts and messages in the active account.
   * - `chat`: search messages within `chatId`.
   */
  scope: PaletteScope
  chatId: number | undefined // Only relevant for the `chat` scope
  query: string
  actions: PaletteActions
}

export function usePaletteItems({
  accountId,
  scope,
  chatId,
  query,
  actions,
}: UsePaletteItemsParams): { items: PaletteItem[]; isLoading: boolean } {
  // `forKey` records which (scope, account, chat, query) the items belong to.
  const currentKey = `${scope}\n${accountId}\n${chatId ?? ''}\n${query.trim()}`
  const [results, setResults] = useState<{
    forKey: string | null
    items: PaletteItem[]
  }>({ forKey: null, items: [] })

  // Read actions through a ref so changing callbacks don't re-run the search.
  const actionsRef = useRef(actions)
  useEffect(() => {
    actionsRef.current = actions
  }, [actions])

  useEffect(() => {
    let cancelled = false
    const trimmed = query.trim()
    const needle = trimmed.toLowerCase()

    // --- Root: switch account ------------------------------------------
    // The only place accounts are listed; filtered by `needle` while typing.
    const loadAccounts = async (): Promise<PaletteItem[]> => {
      const items: PaletteItem[] = []
      const accounts = await getConfiguredAccounts()
      let count = 0
      for (const account of accounts) {
        if (count >= MAX_PER_SECTION.accounts) {
          break
        }
        if (account.kind !== 'Configured' || account.id === accountId) {
          continue
        }
        const label = account.displayName || account.addr || ''
        const haystack = `${account.displayName ?? ''} ${account.addr ?? ''}`
        if (needle !== '' && !haystack.toLowerCase().includes(needle)) {
          continue
        }
        count++
        items.push({
          id: `account-${account.id}`,
          section: 'accounts',
          label,
          subtitle: account.addr ?? undefined,
          avatar: {
            displayName: label,
            avatarPath: account.profileImage,
            color: account.color,
            addr: account.addr ?? undefined,
          },
          // Enter switches to the account; Tab drills into it to browse its
          // chats/messages without switching (until a chat/message is opened).
          accountScope: {
            id: account.id,
            name: label,
            avatarPath: account.profileImage,
            color: account.color,
            addr: account.addr ?? undefined,
          },
          run: async () => {
            await actionsRef.current.switchAccount(account.id)
            actionsRef.current.close()
          },
        })
      }
      return items
    }

    // --- Chats (pinned/recent list when query is empty, filtered while typing) ----------
    const loadChats = async (): Promise<PaletteItem[]> => {
      const items: PaletteItem[] = []
      const entries = await BackendRemote.rpc.getChatlistEntries(
        accountId,
        0,
        trimmed !== '' ? trimmed : null,
        null
      )
      const chatIds = entries.slice(0, MAX_PER_SECTION.chats)
      const chatItems = await BackendRemote.rpc.getChatlistItemsByEntries(
        accountId,
        chatIds
      )
      for (const id of chatIds) {
        const item = chatItems[id]
        if (!item || item.kind !== 'ChatListItem') {
          continue
        }
        items.push({
          id: `chat-${item.id}`,
          section: 'chats',
          label: item.name,
          subtitle: item.summaryText2 || undefined,
          avatar: {
            displayName: item.name,
            avatarPath: item.avatarPath,
            color: item.color,
          },
          // Enter opens the chat; Tab drills into it to search within
          // tbd: maybe show a hint: tab to search within (like github does)
          chatScope: { id: item.id, name: item.name },
          run: () => {
            actionsRef.current.selectChat(accountId, item.id)
            actionsRef.current.close()
          },
        })
      }
      return items
    }

    // --- Contacts -----------------------------------------------------
    const loadContacts = async (): Promise<PaletteItem[]> => {
      const items: PaletteItem[] = []
      const contactIds = (
        await BackendRemote.rpc.getContactIds(accountId, 0, trimmed)
      ).slice(0, MAX_PER_SECTION.contacts)
      const contacts = await BackendRemote.rpc.getContactsByIds(
        accountId,
        contactIds
      )
      for (const id of contactIds) {
        const contact = contacts[id]
        if (!contact) {
          continue
        }
        items.push({
          id: `contact-${contact.id}`,
          section: 'contacts',
          label: contact.displayName,
          subtitle: contact.address || undefined,
          avatar: {
            displayName: contact.displayName,
            avatarPath: contact.profileImage,
            color: contact.color,
            addr: contact.address,
          },
          run: async () => {
            // opens existing chat or creates a new one if none exists
            await actionsRef.current.createChatByContactId(
              accountId,
              contact.id
            )
            actionsRef.current.close()
          },
        })
      }
      return items
    }

    // --- Messages (account-wide or within a single chat) ----------------
    const loadMessages = async (): Promise<PaletteItem[]> => {
      const items: PaletteItem[] = []
      const searchChatId = scope === 'chat' ? (chatId as number) : null
      const rawIds = await BackendRemote.rpc.searchMessages(
        accountId,
        trimmed,
        searchChatId
      )
      // Like `useMessageResultIds`, in-chat results come back oldest-first
      // (reverse them); global results are already newest-first.
      const orderedIds = searchChatId != null ? [...rawIds].reverse() : rawIds
      const msgIds = orderedIds.slice(0, MAX_PER_SECTION.messages)
      const searchResults = await BackendRemote.rpc.messageIdsToSearchResults(
        accountId,
        msgIds
      )
      for (const id of msgIds) {
        const msr = searchResults[id]
        if (!msr) {
          continue
        }
        const sentTime = moment(msr.timestamp * 1000).format('L LT')
        // no need to repeat the chat name for every message if we are in scope chat already
        const label =
          scope === 'chat' ? sentTime : msr.chatName + ' · ' + sentTime
        // Prepend the sender in account-wide search and in group chats,
        const showAuthor = scope === 'account' || msr.chatType !== 'Single'
        const inChat = scope === 'chat'
        items.push({
          id: `message-${msr.id}`,
          section: 'messages',
          label,
          // When searching inside a chat, the datetime label is secondary
          // and the message text is what matters: dim the label and
          // emphasize the message text
          labelDimmed: inChat,
          subtitle: msr.message || undefined,
          subtitleAuthor:
            showAuthor && msr.authorName ? msr.authorName : undefined,
          subtitleStrong: inChat,
          avatar: {
            displayName: msr.chatName,
            avatarPath: msr.chatProfileImage,
            color: msr.chatColor,
          },
          run: () => {
            actionsRef.current.jumpToMessage(accountId, msr.chatId, msr.id)
            actionsRef.current.close()
          },
        })
      }
      return items
    }

    const run = async () => {
      // Root scope is a single group.
      if (scope === 'root') {
        const items = await loadAccounts().catch(error => {
          log.error('failed to load accounts', error)
          return []
        })
        if (!cancelled) {
          setResults({ forKey: currentKey, items })
        }
        return
      }

      const hasQuery = trimmed !== ''
      const inChatScope = scope === 'chat'

      const [chats, contacts, messages] = await Promise.all([
        scope === 'account'
          ? loadChats().catch(error => {
              log.error('failed to search chats', error)
              return []
            })
          : Promise.resolve([]),
        // Contacts and messages only make sense when there is a query.
        scope === 'account' && hasQuery
          ? loadContacts().catch(error => {
              log.error('failed to search contacts', error)
              return []
            })
          : Promise.resolve([]),
        (scope === 'account' || (inChatScope && chatId != null)) && hasQuery
          ? loadMessages().catch(error => {
              log.error('failed to search messages', error)
              return []
            })
          : Promise.resolve([]),
      ])

      if (!cancelled) {
        setResults({
          forKey: currentKey,
          items: [...chats, ...contacts, ...messages],
        })
      }
    }

    // Debounce so we don't fire a search on every keystroke.
    const timeout = setTimeout(run, 200)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
    // `currentKey` captures every input that affects the result set.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey])

  return { items: results.items, isLoading: results.forKey !== currentKey }
}
