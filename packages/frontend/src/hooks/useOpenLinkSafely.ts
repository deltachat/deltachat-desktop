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
  const openNonMailtoLinkSafely = useOpenNonMailtoLinkSafely()

  return useCallback(
    async (accountId: number, url: string) => {
      if (url.startsWith('mailto:')) {
        openMailtoLink(accountId, url)
      } else {
        await openNonMailtoLinkSafely(url)
      }
    },
    [openMailtoLink, openNonMailtoLinkSafely]
  )
}

/**
 * Same as {@link useOpenLinkSafely}, but does not require `accountId`,
 * but the caller guarantees that `url` is not a `mailto:` link.
 */
export function useOpenNonMailtoLinkSafely() {
  const tx = useTranslationFunction()
  const openConfirmationDialog = useConfirmationDialog()

  return useCallback(
    async (url: string) => {
      if (
        url.toLowerCase().startsWith('http:') ||
        url.toLowerCase().startsWith('https:')
      ) {
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
    [openConfirmationDialog, tx]
  )
}
