import { useCallback } from 'react'

import ConfirmationDialog from '../components/dialogs/ConfirmationDialog'
import useDialog from '../hooks/useDialog'
import useTranslationFunction from '../hooks/useTranslationFunction'
import { runtime } from '../runtime'

/**
 * Opens http, https and mailto links, offers to copy all other links.
 */
export default function useOpenLinkSafely() {
  const { openDialog } = useDialog()
  const tx = useTranslationFunction()

  return useCallback(
    (url: string) => {
      if (
        url.startsWith('http:') ||
        url.startsWith('https:') ||
        url.startsWith('mailto:')
      ) {
        runtime.openLink(openDialog, url)
      } else {
        openDialog(ConfirmationDialog, {
          message: tx('ask_copy_unopenable_link_to_clipboard', url),
          confirmLabel: tx('menu_copy_link_to_clipboard'),
          cancelLabel: tx('no'),
          cb: yes => yes && runtime.writeClipboardText(url),
        })
      }
    },
    [tx, openDialog]
  )
}
