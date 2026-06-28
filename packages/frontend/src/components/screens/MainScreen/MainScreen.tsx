import styles from './styles.module.scss'
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { C } from '@deltachat/jsonrpc-client'

import ChatList from '../../chat/ChatList'
import ConnectivityToast from '../../ConnectivityToast'
import SettingsStoreInstance from '../../../stores/settings'
import { BackendRemote, onDCEvent } from '../../../backend-com'
import ChatListHeader from './ChatListHeader'
import { ChatView } from '../../ChatView/ChatView'
import useChat from '../../../hooks/chat/useChat'
import useDialog from '../../../hooks/dialog/useDialog'
import useKeyBindingAction from '../../../hooks/useKeyBindingAction'
import useSelectLastChat from '../../../hooks/chat/useSelectLastChat'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import { KeybindAction } from '../../../keybindings'
import { ScreenContext } from '../../../contexts/ScreenContext'
import MediaView from '../../dialogs/MediaView'
import { useWebxdcMessageSentListener } from '../../../hooks/useWebxdcMessageSent'

import CreateChat from '../../dialogs/CreateChat'
import CommandPalette from '../../dialogs/CommandPalette'
import asyncThrottle from '@jcoreio/async-throttle'
import { useFetch } from '../../../hooks/useFetch'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { GlobalVoiceMessagePlayer } from '../../GlobalVoiceMessagePlayer/GlobalVoiceMessagePlayer'

const log = getLogger('MainScreen')

type Props = {
  accountId?: number
}

export default function MainScreen({ accountId }: Props) {
  // Automatically select last known chat when account changed
  useSelectLastChat(accountId)

  const tx = useTranslationFunction()

  const [queryStr, setQueryStr] = useState('')
  const [queryChatId, setQueryChatId] = useState<null | number>(null)
  const [archivedChatsSelected, setArchivedChatsSelected] = useState(false)
  const { chatId, chatWithLinger, selectChat, unselectChat } = useChat()
  const { smallScreenMode } = useContext(ScreenContext)

  // Small hack/misuse of keyBindingAction to setArchivedChatsSelected from
  // other components (especially ViewProfile when selecting a shared chat/group)
  useKeyBindingAction(KeybindAction.ChatList_SwitchToArchiveView, () =>
    setArchivedChatsSelected(true)
  )
  useKeyBindingAction(KeybindAction.ChatList_SwitchToNormalView, () =>
    setArchivedChatsSelected(false)
  )

  const chatListShouldBeHidden = smallScreenMode && chatId !== undefined
  const messageSectionShouldBeHidden = smallScreenMode && chatId === undefined

  const onChatClick = useCallback(
    (chatId: number) => {
      if (chatId === C.DC_CHAT_ID_ARCHIVED_LINK) {
        setArchivedChatsSelected(true)
        return
      }

      accountId && selectChat(accountId, chatId)
    },
    [accountId, selectChat]
  )

  const searchChats = useCallback(
    (queryStr: string, chatId: number | null = null) => {
      if (smallScreenMode) {
        unselectChat()
      }
      setQueryStr(queryStr)
      setQueryChatId(chatId)
    },
    [smallScreenMode, unselectChat]
  )

  const handleSearchChange = (event: { target: { value: string } }) => {
    setQueryStr(event.target.value)
  }

  const handleSearchClear = useCallback(() => {
    if (searchRef.current) {
      searchRef.current.value = ''
    }
    searchChats('')
    setQueryChatId(null)

    // If we've searched a non-archive chat while being in archive mode
    // previously we want to get back to normal mode after cancelling
    if (!chatWithLinger?.archived && archivedChatsSelected) {
      setArchivedChatsSelected(false)
    }
  }, [archivedChatsSelected, chatWithLinger?.archived, searchChats])

  useEffect(() => {
    window.__chatlistSetSearch = searchChats
  }, [searchChats])

  const searchRef = useRef<HTMLInputElement>(null)

  useKeyBindingAction(KeybindAction.ChatList_FocusSearchInput, () => {
    searchRef.current?.focus()
  })

  useKeyBindingAction(KeybindAction.ChatList_SearchInChat, () => {
    // Also see `search_in_chat` item in ThreeDotMenu.tsx
    searchRef.current?.focus()
    if (chatId == undefined) {
      return
    }
    // Yes, preserve the search string. This might be nice.
    searchChats(queryStr, chatId)
  })

  useKeyBindingAction(KeybindAction.ChatList_ClearSearchInput, () => {
    handleSearchClear()
  })

  const { openDialog } = useDialog()
  useKeyBindingAction(KeybindAction.NewChat_Open, () => {
    // Same as `onCreateChat` in ChatList.
    openDialog(CreateChat)
  })

  const paletteOpenRef = useRef(false)
  useKeyBindingAction(KeybindAction.CommandPalette_OpenSearch, () => {
    if (paletteOpenRef.current) {
      return
    }
    paletteOpenRef.current = true
    openDialog(CommandPalette, {
      mode: 'search' as const,
      onClose: () => {
        paletteOpenRef.current = false
      },
    })
  })

  useKeyBindingAction(KeybindAction.CommandPalette_Open, () => {
    if (paletteOpenRef.current) {
      return
    }
    paletteOpenRef.current = true
    openDialog(CommandPalette, {
      mode: 'command' as const,
      onClose: () => {
        paletteOpenRef.current = false
      },
    })
  })

  useKeyBindingAction(KeybindAction.Chat_Unselect, () => {
    if (chatId !== undefined) {
      unselectChat()
    }
  })

  useKeyBindingAction(KeybindAction.GlobalGallery_Open, () => {
    openDialog(MediaView, {
      chatId: 'all',
    })
  })

  // Throttle in case the user switches chats very rapidly,
  // e.g. by holding down Ctrl + PageDown.
  //
  // TODO a debounce would probably be more appropriate here,
  // given that the operation is relatively expensive,
  // but I haven't looked for an `asyncDebounce` function.
  const throttledFetchLastUsedApps = useMemo(
    () =>
      asyncThrottle(
        async (accountId: number, chatId: number, smallScreenMode: boolean) => {
          const maxIcons = smallScreenMode ? 1 : 3
          const mediaIds = await BackendRemote.rpc.getChatMedia(
            accountId,
            chatId,
            'Webxdc',
            null,
            null
          )
          // mediaIds holds the ids of the last updated apps,
          // in reverse order
          mediaIds.reverse()
          const firstFew = mediaIds.slice(0, maxIcons)

          // TODO perf: if the current throttled fetch was canceled
          // before the next line got executed, we could bail here.
          const mediaLoadResult = await BackendRemote.rpc.getMessages(
            accountId,
            firstFew
          )
          const lastUpdatedApps = firstFew
            .map((id: number) => {
              if (mediaLoadResult[id]?.kind === 'message') {
                return mediaLoadResult[id]
              }
              return null
            })
            .filter(app => app !== null)

          return lastUpdatedApps
        },
        50
      ),
    []
  )
  const lastUsedAppsFetch = useFetch(
    throttledFetchLastUsedApps,
    accountId != undefined && chatId != undefined
      ? [accountId, chatId, smallScreenMode]
      : null
  )
  if (lastUsedAppsFetch?.result?.ok === false) {
    log.error('Failed to fetch last used apps', lastUsedAppsFetch.result.err)
  }

  // Listen for Webxdc messages being sent to the current chat
  useWebxdcMessageSentListener(accountId || 0, chatId || 0, () => {
    // Refresh Webxdc apps list when a Webxdc message is sent
    lastUsedAppsFetch?.refresh()
  })

  useEffect(() => {
    if (!accountId) {
      return
    }
    return onDCEvent(accountId, 'WebxdcInstanceDeleted', () => {
      lastUsedAppsFetch?.refresh()
    })
  }, [accountId, lastUsedAppsFetch])

  // There is another `load()` in `ScreenController.selectAccount()`,
  // but that is not enough because we also need to reload settings
  // after an unconfigured account becomes a configured one,
  // i.e. after login or backup import,
  // which correlates with `MainScreen` becoming rendered.
  //
  // TODO perf: this causes settings to load twice
  // if they are still loading as a result of
  // `ScreenController.selectAccount()`.
  useEffect(() => {
    if (
      SettingsStoreInstance.state?.accountId === accountId &&
      SettingsStoreInstance.state?.settings.configured_addr
    ) {
      log.debug('account is already configured, skipping settings reload')
      return
    }
    SettingsStoreInstance.effect.load()
  }, [accountId])

  const isSearchActive = queryStr.length > 0 || queryChatId !== null
  const showArchivedChats = !isSearchActive && archivedChatsSelected

  const lastUsedApps =
    lastUsedAppsFetch?.result?.ok && lastUsedAppsFetch.result.value.length > 0
      ? lastUsedAppsFetch.result.value
      : []

  return (
    <div
      className={`main-screen ${smallScreenMode ? 'small-screen' : ''} ${
        !messageSectionShouldBeHidden ? 'chat-view-open' : ''
      }`}
    >
      <div className={styles.chatListAndHeaderAndAudioPlayer}>
        <section
          className={styles.chatListAndHeader}
          role='region'
          // TODO a11y: reconsider whether it's OK to use the "Chats" label
          // even when we're searching for messages in one particular chat
          // (`queryChatId`), and even despite the fact
          // that search results, besides chats,
          // also include messages and contacts.
          // For the former, perhaps one could argue that `queryChatId`
          // is just a part of the search query.
          //
          // TODO a11y: perhaps `pref_` is not nice, we might need
          // a separate string.
          // The same goes for other occurrences of `tx('pref_chats')`.
          aria-label={tx('pref_chats')}
        >
          <ChatListHeader
            accountId={accountId}
            showArchivedChats={showArchivedChats}
            onExitArchive={() => setArchivedChatsSelected(false)}
            searchRef={searchRef}
            onSearchChange={handleSearchChange}
            onSearchClear={handleSearchClear}
            queryStr={queryStr}
            queryChatId={queryChatId}
          />
          <ChatList
            queryStr={queryStr}
            showArchivedChats={showArchivedChats}
            onChatClick={onChatClick}
            selectedChatId={chatId ?? null}
            queryChatId={queryChatId}
            onExitSearch={() => {
              setQueryStr('')
              setQueryChatId(null)
            }}
          />
        </section>

        <GlobalVoiceMessagePlayer />
      </div>
      <ChatView
        className={styles.chatView}
        accountId={accountId}
        lastUsedApps={lastUsedApps}
      />
      {!chatListShouldBeHidden && <ConnectivityToast />}
    </div>
  )
}
