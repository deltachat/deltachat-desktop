import React, { useContext, useRef, useEffect } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import { ScreenContext, useTranslationFunction } from '../../contexts'
import Gallery from '../Gallery'
// import { useThreeDotMenu } from '../ThreeDotMenu'
import ChatList from '../chat/ChatList'
import MessageListAndComposer, {
  getBackgroundImageStyle,
} from '../message/MessageListAndComposer'
import {
  useChatStore,
  ChatStoreStateWithChatSet,
  ChatView,
} from '../../stores/chat'
import {
  // openViewGroupDialog,
  // openViewProfileDialog,
  selectChat,
  // setChatView,
  unselectChat,
} from '../helpers/ChatMethods'
import { useKeyBindingAction, KeybindAction } from '../../keybindings'
import ConnectivityToast from '../ConnectivityToast'
import MapComponent from '../map/MapComponent'
// import MailingListProfile from '../dialogs/MessageListProfile'
import { getLogger } from '../../../shared/logger'
import Sidebar from '../Sidebar'
import SettingsStoreInstance, { useSettingsStore } from '../../stores/settings'
// import { Type } from '../../backend-com'
import { SettingsProfileDialog } from '../dialogs/Settings-Profile'
import { TopBar } from '../TopBar'
import { RecoverableCrashScreen } from '../screens/RecoverableCrashScreen'
import {
  MainScreenContext,
  MainScreenContextProvider,
} from './contexts/MainScreenContext'
import { SearchContext } from '../../contexts/SearchContext'

import styles from './styles.module.scss'

const log = getLogger('renderer/main-screen')

export function MainScreen() {
  const screenContext = useContext(ScreenContext)

  const {
    alternativeView,
    showArchivedChats,
    setAlternativeView,
    setShowArchivedChats,
  } = useContext(MainScreenContext)

  const { queryStr, queryChatId, searchChats } = useContext(SearchContext)

  const tx = useTranslationFunction()
  const selectedChat = useChatStore()

  // Small hack/misuse of keyBindingAction to setShowArchivedChats from other components (especially
  // ViewProfile when selecting a shared chat/group)
  useKeyBindingAction(KeybindAction.ChatList_SwitchToArchiveView, () =>
    setShowArchivedChats(true)
  )
  useKeyBindingAction(KeybindAction.ChatList_SwitchToNormalView, () =>
    setShowArchivedChats(false)
  )
  useKeyBindingAction(KeybindAction.GlobalGallery_Open, () => {
    unselectChat()
    setAlternativeView('global-gallery')
  })

  useEffect(() => {
    if (selectedChat.chat?.id) {
      setAlternativeView(null)
    }
  }, [selectedChat.chat?.id, setAlternativeView])

  const onChatClick = (chatId: number) => {
    if (chatId === C.DC_CHAT_ID_ARCHIVED_LINK) return setShowArchivedChats(true)
    selectChat(chatId)
  }

  // const onTitleClick = () => {
  //   if (!selectedChat.chat) return

  //   if (selectedChat.chat.chatType === C.DC_CHAT_TYPE_MAILINGLIST) {
  //     screenContext.openDialog(MailingListProfile, {
  //       chat: selectedChat.chat,
  //     })
  //   } else if (
  //     selectedChat.chat.chatType === C.DC_CHAT_TYPE_GROUP ||
  //     selectedChat.chat.chatType === C.DC_CHAT_TYPE_BROADCAST
  //   ) {
  //     openViewGroupDialog(screenContext, selectedChat.chat)
  //   } else {
  //     if (selectedChat.chat.contactIds && selectedChat.chat.contactIds[0]) {
  //       openViewProfileDialog(screenContext, selectedChat.chat.contactIds[0])
  //     }
  //   }
  // }

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

  const settingsStore = useSettingsStore()[0]

  useEffect(() => {
    SettingsStoreInstance.effect.load().then(() => {
      // make sure it uses new version of settings store instance
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

  // const onClickThreeDotMenu = useThreeDotMenu(
  //   selectedChat.chat,
  //   alternativeView === 'global-gallery' ||
  //     selectedChat?.activeView === ChatView.Media
  //     ? 'gallery'
  //     : 'chat'
  // )

  if (!selectedChat) {
    log.error('selectedChat is undefined')
    return null
  }

  let MessageListView
  if (selectedChat.chat !== null) {
    switch (selectedChat.activeView) {
      case ChatView.Media:
        MessageListView = <Gallery chatId={selectedChat.chat.id} />
        break
      case ChatView.Map:
        MessageListView = <MapComponent selectedChat={selectedChat.chat} />
        break
      case ChatView.MessageList:
      default:
        MessageListView = (
          <RecoverableCrashScreen reset_on_change_key={selectedChat.chat.id}>
            <MessageListAndComposer
              chatStore={selectedChat as ChatStoreStateWithChatSet}
            />
          </RecoverableCrashScreen>
        )
    }
  } else if (alternativeView === 'global-gallery') {
    MessageListView = <Gallery chatId={'all'} />
  } else {
    const style: React.CSSProperties = settingsStore
      ? getBackgroundImageStyle(settingsStore.desktopSettings)
      : {}

    MessageListView = (
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

  return (
    <MainScreenContextProvider>
      <div className={styles.mainScreen}>
        <div>
          <TopBar />
          <ChatList
            queryStr={queryStr}
            showArchivedChats={showArchivedChats}
            onChatClick={onChatClick}
            selectedChatId={selectedChat.chat ? selectedChat.chat.id : null}
            queryChatId={queryChatId}
            onExitSearch={() => {
              searchChats('')
            }}
          />
          {MessageListView}
        </div>
        <Sidebar />
        <ConnectivityToast />
      </div>
    </MainScreenContextProvider>
  )
}

// function chatSubtitle(chat: Type.FullChat) {
//   const tx = window.static_translate
//   if (chat.id && chat.id > C.DC_CHAT_ID_LAST_SPECIAL) {
//     if (chat.chatType === C.DC_CHAT_TYPE_GROUP) {
//       return tx('n_members', [String(chat.contacts.length)], {
//         quantity: chat.contacts.length,
//       })
//     } else if (chat.chatType === C.DC_CHAT_TYPE_MAILINGLIST) {
//       if (chat.mailingListAddress) {
//         return `${tx('mailing_list')} – ${chat.mailingListAddress}`
//       } else {
//         return tx('mailing_list')
//       }
//     } else if (chat.chatType === C.DC_CHAT_TYPE_BROADCAST) {
//       return tx('n_recipients', [String(chat.contacts.length)], {
//         quantity: chat.contacts.length,
//       })
//     } else if (chat.contacts.length >= 1) {
//       if (chat.isSelfTalk) {
//         return tx('chat_self_talk_subtitle')
//       } else if (chat.isDeviceChat) {
//         return tx('device_talk_subtitle')
//       }
//       return chat.contacts[0].address
//     }
//   }
//   return 'ErrTitle'
// }
