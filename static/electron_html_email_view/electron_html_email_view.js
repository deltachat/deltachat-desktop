const subjectElement = document.getElementById('subject')
const fromElement = document.getElementById('sender')
const networkCheckbox = document.getElementById('toggle_network')
const networkButtonLabel = document.getElementById('toggle_network_label')

let promise = window.htmlview
  .getInfo()
  .then(({ subject, from, networkButtonLabelText }) => {
    ;(subjectElement.innerText = subject), (fromElement.innerText = from)
    networkButtonLabel.innerText = networkButtonLabelText
  })

let network_enabled = false

networkCheckbox.onclick = ev => {
  ev.preventDefault()
  const new_value = !network_enabled
  window.htmlview.changeAllowNetwork(new_value).then(() => {
    networkCheckbox.checked = new_value
    network_enabled = new_value
  })
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
