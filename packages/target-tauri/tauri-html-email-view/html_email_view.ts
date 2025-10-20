import { invoke } from '@tauri-apps/api/core'
import type { Theme } from '@deltachat-desktop/shared/shared-types'

const subjectElement = document.getElementById('subject')!
const fromElement = document.getElementById('sender')!
const receiveTimeElement = document.getElementById('receive-time')!
const networkCheckbox = document.getElementById(
  'toggle_network'
)! as HTMLInputElement
const networkButtonLabel = document.getElementById('toggle_network_label')!
const networkMoreButton = document.getElementById(
  'toggle_network_more_button'
)! as HTMLButtonElement

let network_enabled = false

type HtmlInfoType = {
  subject: string
  sender: string
  receiveTime: string
  toggleNetwork: boolean
  networkButtonLabelText: string
  blockedByProxy: boolean
}

invoke<HtmlInfoType>('get_html_window_info').then(
  ({
    subject,
    sender,
    receiveTime,
    toggleNetwork,
    networkButtonLabelText,
    blockedByProxy,
  }) => {
    if (blockedByProxy) {
      networkMoreButton.disabled = true
      networkCheckbox.disabled = true
    }

    subjectElement.innerText = subject
    fromElement.innerText = sender
    networkButtonLabel.innerText = networkButtonLabelText
    networkCheckbox.checked = network_enabled = toggleNetwork
    receiveTimeElement.innerText = receiveTime
  }
)

networkCheckbox.onclick = ev => {
  ev.preventDefault()
  const new_value = !network_enabled
  invoke('html_email_set_load_remote_content', {
    loadRemoteContent: new_value,
  }).then(() => {
    networkCheckbox.checked = new_value
    network_enabled = new_value
  })
}

networkMoreButton.onclick = _ => {
  // const { x, y } = event
  invoke('html_email_open_menu')
}
;(window as any).updateTheme = async () => {
  let themeAddress = await invoke<string>('get_current_active_theme_address')
  if (themeAddress === 'system') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      themeAddress = 'dc:dark'
    } else {
      themeAddress = 'dc:light'
    }
  }
  const [_theme, theme_content] = await invoke<
    [theme: Theme, theme_content: string]
  >('get_theme', { themeAddress })

  const themeVars = window.document.getElementById('theme-vars')
  if (!themeVars) {
    throw new Error('#theme-vars element not found')
  }
  themeVars.innerText = theme_content
}
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', event => {
    // eslint-disable-next-line no-console
    console.debug('system theme changed:', { dark_theme: event.matches })
    ;(window as any).updateTheme()
  })
;(window as any).updateTheme()
