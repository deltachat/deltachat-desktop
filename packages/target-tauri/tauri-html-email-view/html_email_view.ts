import { invoke } from '@tauri-apps/api/core'

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
