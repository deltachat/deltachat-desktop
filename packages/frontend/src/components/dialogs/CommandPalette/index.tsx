import React, { useEffect, useId, useRef, useState, useMemo } from 'react'

import Dialog from '../../Dialog'
import Icon, { type IconName } from '../../Icon'
import { Avatar } from '../../Avatar'
import { BackendRemote } from '../../../backend-com'
import { selectedAccountId } from '../../../ScreenController'
import useChat from '../../../hooks/chat/useChat'
import useMessage from '../../../hooks/chat/useMessage'
import useCreateChatByContactId from '../../../hooks/chat/useCreateChatByContactId'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { useRpcFetch } from '../../../hooks/useFetch'
import useAlertDialog from '../../../hooks/dialog/useAlertDialog'
import {
  saveLastChatId,
  createChatByContactId as createChatByContactIdBackend,
} from '../../../backend/chat'
import { usePaletteSearch, type PaletteActions } from './usePaletteSearch'
import { usePaletteCommands } from './usePaletteCommands'
import { getLogger } from '@deltachat-desktop/shared/logger'

import styles from './styles.module.scss'

import type { DialogProps } from '../../../contexts/DialogContext'
import type {
  PaletteFilter,
  PaletteItem,
  PaletteScope,
  PaletteSection,
  AccountPartial,
} from './types'

const log = getLogger('renderer/CommandPalette')

/**
 * Tokens that activate the unread filter.
 * `is:unread` is an existing filter in core
 * `:unread` as convenience alias.
 * Adding a space creates a filter badge See {@link PaletteFilter}.
 */
const UNREAD_FILTER_TRIGGER = /^(?:is)?:unread\s/i

type Props = {
  mode?: 'search' | 'command'
  onClose: DialogProps['onClose']
}

const SECTION_ICON: Record<PaletteSection, IconName> = {
  accounts: 'swap_vert',
  chats: 'forum',
  contacts: 'person',
  messages: 'chat_bubble',
  commands: 'settings',
}

function sectionLabel(
  tx: ReturnType<typeof useTranslationFunction>,
  section: PaletteSection
): string {
  switch (section) {
    case 'accounts':
      return tx('switch_account')
    case 'chats':
      return tx('pref_chats')
    case 'contacts':
      return tx('contacts_headline')
    case 'messages':
      return tx('messages')
    case 'commands':
      return tx('command_palette_commands_section')
  }
}

export default function CommandPalette({ mode = 'search', onClose }: Props) {
  const tx = useTranslationFunction()
  const currentAccountId = selectedAccountId()
  const { selectChat, chatId: openChatId } = useChat()
  const { jumpToMessage } = useMessage()
  const createChatByContactId = useCreateChatByContactId()
  const openAlertDialog = useAlertDialog()

  // Breadcrumb scope, opens with current account account showing the chatlist
  // Tab adds the highlighted chat to the breadcrumb , Backspace on an empty
  // query pops one crumb off
  const [scope, setScope] = useState<PaletteScope>('account')
  // When set (after Tab on an account in root scope) the palette browses this
  // account instead of the active one, *without* switching to it. The switch
  // only happens once a chat/message is actually opened with enter
  const [scopedAccount, setScopedAccount] = useState<AccountPartial | null>(
    null
  )
  const [scopedChat, setScopedChat] = useState<{
    id: number
    name: string
  } | null>(null)
  // when opened in command mode `>` is added to the input
  const [query, setQuery] = useState(mode === 'command' ? '>' : '')
  // Active filter keyword (e.g. `:unread`), shown as a badge.
  // cleared when the scope changes
  const [filter, setFilter] = useState<PaletteFilter | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // The account the chats/contacts/messages are searched in: the peeked
  // account when browsing another one, otherwise the active account.
  const effectiveAccountId = scopedAccount?.id ?? currentAccountId

  const accountFetch = useRpcFetch(BackendRemote.rpc.getAccountInfo, [
    currentAccountId,
  ])
  const accountInfo = accountFetch?.lingeringResult?.ok
    ? accountFetch.lingeringResult.value
    : null
  let accountName = ''
  let avatarPath: string | undefined = undefined
  let accountColor: string | undefined = undefined
  if (scopedAccount) {
    accountName = scopedAccount.name
    avatarPath = scopedAccount.avatarPath || undefined
    accountColor = scopedAccount.color || undefined
  } else if (accountInfo?.kind === 'Configured') {
    accountName = accountInfo.displayName || accountInfo.addr || ''
    avatarPath = accountInfo.profileImage || undefined
    accountColor = accountInfo.color || undefined
  }
  const chatName = scopedChat?.name ?? ''

  const actions: PaletteActions = useMemo(
    () => ({
      selectChat: async (scopeAccountId, cId) => {
        if (scopeAccountId === currentAccountId) {
          selectChat(scopeAccountId, cId)
          return
        }
        try {
          await saveLastChatId(scopeAccountId, cId)
          await window.__selectAccount(scopeAccountId)
        } catch (error) {
          log.error('failed to open chat in other account', error)
        }
      },
      jumpToMessage: async (scopeAccountId, cId, msgId) => {
        if (scopeAccountId === currentAccountId) {
          jumpToMessage({
            accountId: scopeAccountId,
            msgId,
            msgChatId: cId,
            focus: false,
            scrollIntoViewArg: { block: 'center' },
          })
          return
        }
        try {
          // `jumpToMessage` can't cross accounts, so switch first and then jump
          // once the target account's message list mounts.
          await saveLastChatId(scopeAccountId, cId)
          await window.__selectAccount(scopeAccountId)
          window.__internal_jump_to_message_asap = {
            accountId: scopeAccountId,
            chatId: cId,
            jumpToMessageArgs: [
              { msgId, scrollIntoViewArg: { block: 'center' }, focus: false },
            ],
          }
          window.__internal_check_jump_to_message?.()
        } catch (error) {
          log.error('failed to jump to message in other account', error)
        }
      },
      createChatByContactId: async (scopeAccountId, contactId) => {
        if (scopeAccountId === currentAccountId) {
          await createChatByContactId(scopeAccountId, contactId)
          return
        }
        try {
          const cId = await createChatByContactIdBackend(
            scopeAccountId,
            contactId
          )
          const chat = await BackendRemote.rpc.getBasicChatInfo(
            scopeAccountId,
            cId
          )
          if (chat.archived) {
            await BackendRemote.rpc.setChatVisibility(
              scopeAccountId,
              cId,
              'Normal'
            )
          }
          await saveLastChatId(scopeAccountId, cId)
          await window.__selectAccount(scopeAccountId)
        } catch (error) {
          log.error('failed to open contact chat in other account', error)
        }
      },
      switchAccount: window.__selectAccount,
      close: onClose,
    }),
    [
      currentAccountId,
      selectChat,
      jumpToMessage,
      createChatByContactId,
      onClose,
    ]
  )

  // Command mode: typing `>` switches from search to command mode
  const isCommandMode = query.startsWith('>') && !filter
  const commandFilter = isCommandMode ? query.slice(1).trim().toLowerCase() : ''

  const commands = usePaletteCommands({
    accountId: effectiveAccountId,
    scopedChat,
    selectedChatId: openChatId ?? null,
    close: onClose,
  })

  const { items: searchItems, isLoading } = usePaletteSearch({
    accountId: effectiveAccountId,
    scope,
    chatId: scopedChat?.id,
    query,
    filter: scope === 'account' ? filter : null,
    actions,
    enabled: !isCommandMode,
  })

  const items = useMemo(() => {
    if (!isCommandMode) {
      return searchItems
    }
    if (commandFilter === '') {
      return commands
    }
    return commands.filter(c => c.label.toLowerCase().includes(commandFilter))
  }, [isCommandMode, commandFilter, commands, searchItems])

  // Reset the highlight to the top whenever the result set changes
  const [itemsForActive, setItemsForActive] = useState(items)
  if (itemsForActive !== items) {
    setItemsForActive(items)
    setActiveIndex(0)
  }

  // Scroll the active row into view as the user navigates with the keyboard.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-item-index="${activeIndex}"]`
    )
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const runItem = (item: PaletteItem | undefined) => {
    void item?.run()
  }

  const onQueryChange = (value: string) => {
    if (value.startsWith('>') && !isCommandMode && scopedAccount !== null) {
      // command mode should only apply to current active account
      // so we lock the `>` trigger and show a warning if in another scope
      openAlertDialog({
        message: tx('commands_in_current_account_only'),
      }).then(() => {
        setTimeout(() => inputRef.current?.focus(), 0)
      })
      return
    }
    // If a filter token is detected add it as filter badge
    // For now filters only apply in the `account` scope
    if (
      filter == null &&
      scope === 'account' &&
      UNREAD_FILTER_TRIGGER.test(value)
    ) {
      setFilter('unread')
      setQuery(
        value.replace(UNREAD_FILTER_TRIGGER, ' ').replace(/\s+/g, ' ').trim()
      )
      return
    }
    setQuery(value)
  }

  const popScope = () => {
    if (scope === 'chat') {
      setScope('account')
      setScopedChat(null)
    } else if (scope === 'account') {
      setScope('root')
      // Leaving the peeked account goes back to the account list.
      setScopedAccount(null)
      setFilter(null)
    }
  }

  const enterChatScope = (chat: { id: number; name: string }) => {
    setScope('chat')
    setScopedChat(chat)
    setQuery('')
    setFilter(null)
  }

  const enterAccountScope = (account: AccountPartial) => {
    setScope('account')
    setScopedAccount(account)
    setScopedChat(null)
    setQuery('')
    setFilter(null)
  }

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      runItem(items[activeIndex])
    } else if (e.key === 'Tab') {
      // Tab enters into the highlighted items scope: a chat to search within it,
      // or (in root scope) an account to browse without switching to it.
      const item = items[activeIndex]
      if (item?.chatScope) {
        e.preventDefault()
        enterChatScope(item.chatScope)
      } else if (item?.accountScope) {
        e.preventDefault()
        enterAccountScope(item.accountScope)
      }
    } else if (e.key === 'Backspace' && query === '' && filter != null) {
      // The filter crumb is innermost, so remove it before popping the scope.
      e.preventDefault()
      setFilter(null)
    } else if (e.key === 'Backspace' && query === '' && scope !== 'root') {
      e.preventDefault()
      popScope()
    }
  }

  const placeholder =
    scope === 'root'
      ? tx('switch_account')
      : scope === 'chat'
        ? tx('search_in_chat')
        : tx('search_explain')

  const showNoResults =
    !isLoading && items.length === 0 && (query.trim() !== '' || filter != null)

  // concerning accessibility this implementation tries to follow the recommendations of
  // https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/

  // Unique ids for all items
  const baseId = useId()
  const listboxId = `${baseId}-listbox`
  const optionId = (index: number) => `${baseId}-opt-${index}`
  const groupHeaderId = (section: PaletteSection) => `${baseId}-grp-${section}`

  const hasActiveOption = items.length > 0
  const activeOptionIndex = Math.max(0, Math.min(activeIndex, items.length - 1))

  // Group items by their `section` so we can render section headers
  const groups = useMemo(() => {
    const groups: {
      section: PaletteSection
      entries: { item: PaletteItem; index: number }[]
    }[] = []
    items.forEach((item, index) => {
      const last = groups[groups.length - 1]
      if (last && last.section === item.section) {
        last.entries.push({ item, index })
      } else {
        groups.push({ section: item.section, entries: [{ item, index }] })
      }
    })
    return groups
  }, [items])

  return (
    <Dialog
      className={styles.commandPalette}
      onClose={onClose}
      width={640}
      noTopPadding
      fixed
    >
      <div className={styles.searchRow}>
        <Icon className={styles.searchIcon} icon='search' size={20} />
        {(scope === 'account' || scope === 'chat') && (
          <span className={styles.crumb}>
            <Avatar
              small
              displayName={accountName}
              avatarPath={avatarPath}
              color={accountColor}
              aria-hidden
            />
            <span className={styles.crumbLabel}>{accountName}</span>
            <span className={styles.crumbSep}>/</span>
          </span>
        )}
        {scope === 'chat' && (
          <span className={styles.crumb}>
            <Icon icon='forum' size={16} />
            <span className={styles.crumbLabel}>{chatName}</span>
            <span className={styles.crumbSep}>/</span>
          </span>
        )}
        {scope === 'account' && filter === 'unread' && (
          <span className={styles.filterCrumb}>
            <span className={styles.crumbLabel}>
              {tx('command_palette_filter_unread')}
            </span>
            <button
              type='button'
              className={styles.crumbRemove}
              aria-label={tx('remove_desktop')}
              onClick={() => {
                setFilter(null)
                inputRef.current?.focus()
              }}
            >
              <Icon icon='cross' size={14} />
            </button>
          </span>
        )}
        <input
          id='command-palette-search'
          ref={inputRef}
          className={`search-input ${styles.searchInput}`}
          data-no-drag-region
          autoFocus
          spellCheck={false}
          placeholder={placeholder}
          value={query}
          onChange={e => onQueryChange(e.target.value)}
          onKeyDown={onInputKeyDown}
          aria-label={tx('search')}
          role='combobox'
          aria-autocomplete='list'
          aria-haspopup='listbox'
          aria-expanded={hasActiveOption}
          aria-controls={listboxId}
          aria-activedescendant={
            hasActiveOption ? optionId(activeOptionIndex) : undefined
          }
        />
        {query !== '' && (
          <button
            type='button'
            className={styles.clearButton}
            aria-label={tx('clear_search')}
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
          >
            <Icon icon='clear' size={18} />
          </button>
        )}
      </div>
      <div className={styles.list} ref={listRef}>
        <div role='status' style={{ display: 'contents' }}>
          {showNoResults && (
            <div className={styles.empty} role='status'>
              {isCommandMode
                ? tx('search_no_result_for_x', commandFilter)
                : query.trim() !== ''
                  ? tx('search_no_result_for_x', query)
                  : filter === 'unread'
                    ? tx('command_palette_no_unread')
                    : tx('search_no_result_for_x', query)}
            </div>
          )}
        </div>
        <div role='listbox' id={listboxId} aria-label={tx('search_explain')}>
          {groups.map(group => (
            <div
              key={group.section}
              role='group'
              aria-labelledby={groupHeaderId(group.section)}
            >
              <div
                className={styles.sectionHeader}
                id={groupHeaderId(group.section)}
              >
                <Icon icon={SECTION_ICON[group.section]} size={14} />
                <span>{sectionLabel(tx, group.section)}</span>
              </div>
              {group.entries.map(({ item, index }) => {
                const isActive = index === activeOptionIndex
                return (
                  <div
                    key={item.id}
                    role='option'
                    id={optionId(index)}
                    aria-selected={isActive}
                    data-item-index={index}
                    className={`${styles.item} ${
                      isActive ? styles.itemActive : ''
                    }`}
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => runItem(item)}
                    title={item.subtitle ? `${item.subtitle}` : item.label}
                  >
                    {item.icon ? (
                      <span className={styles.itemIcon}>
                        <Icon icon={item.icon} size={item.iconSize ?? 20} />
                      </span>
                    ) : (
                      item.avatar && (
                        <Avatar
                          small
                          displayName={item.avatar.displayName}
                          avatarPath={item.avatar.avatarPath || undefined}
                          color={item.avatar.color}
                          addr={item.avatar.addr}
                          aria-hidden
                        />
                      )
                    )}
                    <span className={styles.itemText}>
                      <span
                        className={`${styles.itemLabel} ${
                          item.labelDimmed ? styles.dimmed : ''
                        }`}
                      >
                        {item.label}
                      </span>
                      {(item.subtitle || item.subtitleAuthor) && (
                        <span className={styles.itemSubtitle}>
                          {item.subtitleAuthor && (
                            <span className={styles.dimmed}>
                              {item.subtitleAuthor}:{' '}
                            </span>
                          )}
                          <span
                            className={
                              item.subtitleStrong ? undefined : styles.dimmed
                            }
                          >
                            {item.subtitle}
                          </span>
                        </span>
                      )}
                    </span>
                    {item.freshMessageCounter ? (
                      <span
                        className={`${styles.freshMessageCounter} ${
                          item.isMuted ? styles.freshMessageCounterMuted : ''
                        }`}
                        aria-label={tx(
                          'chat_n_new_messages',
                          String(item.freshMessageCounter),
                          { quantity: item.freshMessageCounter }
                        )}
                      >
                        {item.freshMessageCounter}
                      </span>
                    ) : null}
                    {isActive && (item.chatScope || item.accountScope) && (
                      <span className={styles.tabHint} aria-hidden>
                        {tx('command_palette_tab_to_search')}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  )
}
