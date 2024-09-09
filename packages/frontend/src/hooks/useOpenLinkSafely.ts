import { useCallback } from 'react'

import useConfirmationDialog from './dialog/useConfirmationDialog'
import useOpenMailtoLink from './useOpenMailtoLink'
import useTranslationFunction from './useTranslationFunction'
import { runtime } from '@deltachat-desktop/runtime-interface'

/**
 * Opens http, https and mailto links, offers to copy all other links.
 */
export default function useOpenLinkSafely() {
  const openMailtoLink = useOpenMailtoLink()
  const tx = useTranslationFunction()
  const openConfirmationDialog = useConfirmationDialog()

  return useCallback(
    async (accountId: number, url: string) => {
      if (url.startsWith('mailto:')) {
        openMailtoLink(accountId, url)
      } else if (url.startsWith('http:') || url.startsWith('https:')) {
        runtime.openLink(url)
      } else {
        const userConfirmed = await openConfirmationDialog({
          message: tx('ask_copy_unopenable_link_to_clipboard', url),
          confirmLabel: tx('menu_copy_link_to_clipboard'),
          cancelLabel: tx('no'),
        })

        if (userConfirmed) {
          runtime.writeClipboardText(url)
        }
      }
    },
    [openMailtoLink, openConfirmationDialog, tx]
  )
}
