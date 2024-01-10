import { useContext } from 'react'

import { ReactionsShortcutBarContext } from './ReactionsShortcutBarContext'

export default function useReactionsShortcutBar() {
  const { showReactionsBar, hideReactionsBar } = useContext(
    ReactionsShortcutBarContext
  )

  return {
    showReactionsBar,
    hideReactionsBar,
  }
}
