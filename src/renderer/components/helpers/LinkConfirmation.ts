import { runtime } from '../../runtime'
import ConfirmationDialog from '../dialogs/ConfirmationDialog'

import type { OpenDialog } from '../../contexts/DialogContext'

/** opens http, https and mailto links, offers to copy all other links */
export function openLinkSafely(openDialog: OpenDialog, url: string) {
  const tx = window.static_translate

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
}
