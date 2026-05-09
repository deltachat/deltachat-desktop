const subjectElement = document.getElementById('subject')
const fromElement = document.getElementById('sender')
const sentTimeElement = document.getElementById('sent-time')
const networkMoreButton = document.getElementById('toggle_network_more_button')

let promise = window.htmlview.getInfo().then(({ subject, from, sentTime }) => {
  ;((subjectElement.innerText = subject), (fromElement.innerText = from))
  sentTimeElement.innerText = sentTime
})

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
