import { useContext } from 'react'

import { ReactionsShortcutBarContext } from '.'

export default function useReactionsShortcutBar() {
  const { showReactionsBar, hideReactionsBar } = useContext(
    ReactionsShortcutBarContext
  )

  return {
    showReactionsBar,
    hideReactionsBar,
  }
}
