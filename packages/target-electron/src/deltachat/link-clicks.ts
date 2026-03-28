import { shell, dialog, clipboard, type BrowserWindow } from 'electron'
import { tx } from '../load-translations.js'

/**
 * Opens the link externally (in the browser) if it's an HTTP(S) link,
 * or opens a dialog suggesting to copy the link if it's not an HTTP(S) link.
 *
 * This should only be called if the user confirmed their intent
 * to open the link. Preferably the user also got a chance to look
 * at the link text, in its ASCII (i.e. Punycode) form.
 * If that's the case, this can be used for untrusted links.
 *
 * @param win the window on which the "copy?" dialog will be opened.
 *
 * @see `useOpenLinkSafely`
 * @see `open_url`
 */
export async function openExternalHttpOrPromptToCopy(
  win: BrowserWindow,
  url: string
): Promise<void> {
  if (
    url.toLowerCase().startsWith('https:') ||
    url.toLowerCase().startsWith('http:')
  ) {
    shell.openExternal(url)
  } else if (url) {
    await dialog
      .showMessageBox(win, {
        buttons: [tx('no'), tx('menu_copy_link_to_clipboard')],
        message: tx('ask_copy_unopenable_link_to_clipboard', url),
      })
      .then(({ response }) => {
        if (response == 1) {
          clipboard.writeText(url)
        }
      })
  }
}
