import { runtime } from '../../runtime'
import ConfirmationDialog from '../dialogs/ConfirmationDialog'

/** opens http, https and mailto links, offers to copy all other links */
export function openLinkSafely(url: string) {
  const tx = window.static_translate
  if (
    url.startsWith('http:') ||
    url.startsWith('https:') ||
    url.startsWith('mailto:')
  ) {
    runtime.openLink(url)
  } else {
    window.__openDialog(ConfirmationDialog, {
      message: tx('ask_copy_unopenable_link_to_clipboard', url),
      confirmLabel: tx('menu_copy_link_to_clipboard'),
      cancelLabel: tx('no'),
      cb: yes => yes && runtime.writeClipboardText(url),
    })
  }
}
