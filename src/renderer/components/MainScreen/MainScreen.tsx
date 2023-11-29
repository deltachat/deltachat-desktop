import React, { useContext, useRef, useEffect, useCallback } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import { ScreenContext, useTranslationFunction } from '../../contexts'
import Gallery from '../Gallery'
import ChatList from '../chat/ChatList'
import MessageListAndComposer, {
  getBackgroundImageStyle,
} from '../message/MessageListAndComposer'
import {
  useChatStore,
  ChatStoreStateWithChatSet,
  ChatView,
} from '../../stores/chat'
import { selectChat } from '../helpers/ChatMethods'
import { useKeyBindingAction, KeybindAction } from '../../keybindings'
import ConnectivityToast from '../ConnectivityToast'
import MapComponent from '../map/MapComponent'
import { getLogger } from '../../../shared/logger'
import Sidebar from '../Sidebar'
import SettingsStoreInstance, { useSettingsStore } from '../../stores/settings'
import { SettingsProfileDialog } from '../dialogs/Settings-Profile'
import { TopBar } from '../TopBar'
import { RecoverableCrashScreen } from '../screens/RecoverableCrashScreen'
import { MainScreenContextProvider } from './contexts/MainScreenContext'
import { SearchContext } from '../../contexts/SearchContext'
import { useMainView } from './hooks/useMainView'

import styles from './styles.module.scss'

const log = getLogger('renderer/main-screen')

export function MainScreen() {
  const screenContext = useContext(ScreenContext)
  const tx = useTranslationFunction()
  const selectedChat = useChatStore()

  // @TODO: Move into own component
  const isFirstLoad = useRef(true)
  if (isFirstLoad.current) {
    isFirstLoad.current = false
    SettingsStoreInstance.effect.load().then(() => {
      const lastChatId =
        SettingsStoreInstance.getState()?.settings['ui.lastchatid']
      if (lastChatId) {
        selectChat(Number(lastChatId))
      }
    })
  }

  // @TODO: Move into own component
  useEffect(() => {
    SettingsStoreInstance.effect.load().then(() => {
      // Make sure it uses new version of settings store instance
      const settingsStore = SettingsStoreInstance.state
      if (settingsStore && window.__askForName) {
        window.__askForName = false
        screenContext.openDialog(SettingsProfileDialog, {
          settingsStore,
          title: 'Account setup',
          confirmLabel: tx('ok'),
          cancelLabel: tx('later'),
          firstSetup: true,
        })
      }
    })
  }, [screenContext, tx])

  if (!selectedChat) {
    log.error('selectedChat is undefined')
    return null
  }

  return (
    <MainScreenContextProvider>
      <MainScreenKeyBindings />
      <div className={styles.mainScreen}>
        <TopBar />
        <>
          <SecondaryView />
          <PrimaryView />
        </>
        <Sidebar />
        <ConnectivityToast />
      </div>
    </MainScreenContextProvider>
  )
}

function PrimaryView() {
  const { mainView } = useMainView()
  const settingsStore = useSettingsStore()[0]
  const tx = useTranslationFunction()
  const selectedChat = useChatStore()

  if (selectedChat.chat !== null) {
    switch (selectedChat.activeView) {
      case ChatView.Media:
        return <Gallery chatId={selectedChat.chat.id} />
      case ChatView.Map:
        return <MapComponent selectedChat={selectedChat.chat} />
      case ChatView.MessageList:
      default:
        return (
          <RecoverableCrashScreen reset_on_change_key={selectedChat.chat.id}>
            <MessageListAndComposer
              chatStore={selectedChat as ChatStoreStateWithChatSet}
            />
          </RecoverableCrashScreen>
        )
    }
  } else if (mainView === 'global-gallery') {
    return <Gallery chatId={'all'} />
  } else {
    const style: React.CSSProperties = settingsStore
      ? getBackgroundImageStyle(settingsStore.desktopSettings)
      : {}

    return (
      <div className='message-list-and-composer' style={style}>
        <div
          className='message-list-and-composer__message-list'
          style={{ display: 'flex' }}
        >
          <div className='info-message big' style={{ alignSelf: 'center' }}>
            <div className='bubble'>
              {tx('no_chat_selected_suggestion_desktop')}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

function SecondaryView() {
  const { mainView, switchToChat, switchToArchive } = useMainView()
  const { queryStr, queryChatId, searchChats } = useContext(SearchContext)
  const selectedChat = useChatStore()

  const handleChatClick = useCallback(
    (chatId: number) => {
      if (chatId === C.DC_CHAT_ID_ARCHIVED_LINK) {
        switchToArchive()
      } else {
        switchToChat(chatId)
      }
    },
    [switchToArchive, switchToChat]
  )

  return (
    <ChatList
      queryStr={queryStr}
      showArchivedChats={mainView === 'archive'}
      onChatClick={handleChatClick}
      selectedChatId={selectedChat.chat ? selectedChat.chat.id : null}
      queryChatId={queryChatId}
      onExitSearch={() => {
        searchChats('')
      }}
    />
  )
}

// Small hack/misuse of keyBindingAction to setShowArchivedChats from other
// components (especially ViewProfile when selecting a shared chat/group)
function MainScreenKeyBindings() {
  const { switchToArchive, switchToGlobalGallery, switchToChat } = useMainView()

  useKeyBindingAction(KeybindAction.ChatList_SwitchToNormalView, switchToChat)
  useKeyBindingAction(
    KeybindAction.ChatList_SwitchToArchiveView,
    () => switchToArchive
  )
  useKeyBindingAction(KeybindAction.GlobalGallery_Open, switchToGlobalGallery)

  return null
}
