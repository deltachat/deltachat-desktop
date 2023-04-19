const subjectElement = document.getElementById('subject')
const fromElement = document.getElementById('sender')
const receiveTimeElement = document.getElementById('receive-time')
const networkCheckbox = document.getElementById('toggle_network')
const networkButtonLabel = document.getElementById('toggle_network_label')
const networkMoreButton = document.getElementById('toggle_network_more_button')

window.network_enabled = false

let promise = window.htmlview
  .getInfo()
  .then(
    ({
      subject,
      from,
      receiveTime,
      toggle_network,
      networkButtonLabelText,
    }) => {
      ;(subjectElement.innerText = subject), (fromElement.innerText = from)
      networkButtonLabel.innerText = networkButtonLabelText
      networkCheckbox.checked = window.network_enabled = toggle_network
      receiveTimeElement.innerText = receiveTime
    }
  )

networkCheckbox.onclick = ev => {
  ev.preventDefault()
  const new_value = !window.network_enabled
  window.htmlview.changeAllowNetwork(new_value).then(() => {
    networkCheckbox.checked = new_value
    window.network_enabled = new_value
  })
}

networkMoreButton.onclick = ev => {
  /** @type {MouseEvent} */
  const event = ev
  const { x, y } = event
  window.htmlview.openMoreMenu({ x, y })
}

const contentElement = document.getElementById('content')
function updateContentBounds() {
  const { x, y, width, height } = contentElement.getBoundingClientRect()
  window.htmlview.setContentBounds({
    x: Math.floor(x),
    y: Math.floor(y),
    width: Math.floor(width),
    height: Math.floor(height),
  })
}
window.onresize = updateContentBounds

// when load of meta data Finished
promise.then(updateContentBounds)
