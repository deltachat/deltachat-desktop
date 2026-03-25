import { shell, dialog, clipboard, type BrowserWindow } from 'electron'
import { tx } from '../load-translations.js'

/**
 * @see the white list on Android
 * https://github.com/deltachat/deltachat-android/blob/c2f492463fb0b5e0278f25c6e92c897d11764eea/src/main/java/org/thoughtcrime/securesms/WebViewActivity.java#L108-L119
 */
const whitelist = [
  'http:',
  'https:',
  'gemini:',
  'tel:',
  'sms:',
  // Note that `mailto:` and `openpgp4fpr:` links
  // are usually already handled otherwise,
  // e.g. with `open_url`, instead of getting passed to
  // `openExternalWhitelistedOrPromptToCopy`.
  'mailto:',
  'openpgp4fpr:',
  'geo:',
  'dcaccount:',
  'dclogin:',
]

/**
 * Opens the link externally (e.g. in the browser if it's an HTTP(S) link),
 * or opens a dialog suggesting to copy the link
 * if the protocol is not in the whitelist.
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
export async function openExternalWhitelistedOrPromptToCopy(
  win: BrowserWindow,
  url: string
): Promise<void> {
  const lowercase = url.toLowerCase()
  if (whitelist.some(scheme => lowercase.startsWith(scheme))) {
    shell.openExternal(url)
  } else if (url) {
    promptToCopy(win, url)
  }
}
/**
 * Like {@linkcode openExternalWhitelistedOrPromptToCopy},
 * but only `http:` and `https:` are whitelisted.
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
    promptToCopy(win, url)
  }
}

async function promptToCopy(win: BrowserWindow, url: string) {
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
