import { useEffect } from 'react'

import { matchesLetterShortcut } from '../keybindings'

/**
 * The browser's default "select all" grabs all the text of the app UI —
 * which is not wanted since this is an app not a website
 *
 * So `Ctrl + A` does nothing outside of text fields, with one exception:
 * if the user has already selected some text inside a single message,
 * the selection is extended to that whole message text.
 */
export function useSelectAllKeyboardShortcut() {
  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      const isSelectAll =
        (ev.ctrlKey || ev.metaKey) &&
        !ev.altKey &&
        !ev.shiftKey &&
        matchesLetterShortcut(ev, 'a')
      if (!isSelectAll) {
        return
      }

      const target = ev.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return
      }
      ev.preventDefault()

      const selection = window.getSelection()
      if (selection == null || selection.isCollapsed) {
        return
      }
      const commonAncestor = selection.getRangeAt(0).commonAncestorContainer
      const selectedElement =
        commonAncestor instanceof Element
          ? commonAncestor
          : commonAncestor.parentElement
      const messageText = selectedElement?.closest('.msg-body .text')
      if (messageText == null) {
        return
      }

      const range = document.createRange()
      range.selectNodeContents(messageText)
      selection.removeAllRanges()
      selection.addRange(range)
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [])
}
