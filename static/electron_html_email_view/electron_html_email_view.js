const subjectElement = document.getElementById('subject')
const fromElement = document.getElementById('sender')

let promise = window.htmlview.getInfo().then(({ subject, from }) => {
  ;(subjectElement.innerText = subject), (fromElement.innerText = from)
})

let network_enabled = false
const networkButton = document.getElementById('toggle_network')
function updateLabel() {
  networkButton.innerText = network_enabled
    ? 'Deny Remote Content'
    : 'Load Remote Content'
}
networkButton.onclick = () => {
  network_enabled = !network_enabled
  updateLabel()
  window.htmlview.changeAllowNetwork(network_enabled)
}
updateLabel()

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
