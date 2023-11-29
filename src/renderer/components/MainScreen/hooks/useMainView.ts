import { useContext } from 'react'

import { MainScreenContext } from '../contexts/MainScreenContext'
import { selectChat, unselectChat } from '../../helpers/ChatMethods'

export function useMainView() {
  const { mainView, setMainView } = useContext(MainScreenContext)

  const switchToGlobalGallery = () => {
    unselectChat()
    setMainView('global-gallery')
  }

  const switchToChat = (chatId?: number) => {
    if (chatId) {
      selectChat(chatId)
    } else {
      unselectChat()
    }

    // @TODO: What if selected chat was archived?
    setMainView('chats')
  }

  const switchToArchive = () => {
    setMainView('archive')
  }

  return {
    mainView,
    switchToArchive,
    switchToChat,
    switchToGlobalGallery,
  }
}
