const subjectElement = document.getElementById('subject')
const fromElement = document.getElementById('sender')
const sentTimeElement = document.getElementById('sent-time')
const networkMoreButton = document.getElementById('toggle_network_more_button')

let promise = window.htmlview
  .getInfo()
  .then(({ subject, from, sentTime, locale }) => {
    ;((subjectElement.innerText = subject), (fromElement.innerText = from))
    sentTimeElement.innerText = sentTime
    if (locale) {
      document.documentElement.lang = locale.replace('_', '-')
    }
  })

const moreMenuDropdown = document.getElementById('more-menu-dropdown')
const loadRemoteContentBtn = document.getElementById('load-remote-content-btn')

window.htmlview.getMenuLabels().then(({ load_remote_content }) => {
  loadRemoteContentBtn.textContent = load_remote_content
})

networkMoreButton.onclick = ev => {
  ev.stopPropagation()
  const open = moreMenuDropdown.hidden
  moreMenuDropdown.hidden = !open
  networkMoreButton.setAttribute('aria-expanded', String(open))
}

loadRemoteContentBtn.onclick = () => {
  moreMenuDropdown.hidden = true
  networkMoreButton.setAttribute('aria-expanded', 'false')
  window.htmlview.triggerLoadRemoteContent()
}

document.addEventListener('click', () => {
  moreMenuDropdown.hidden = true
  networkMoreButton.setAttribute('aria-expanded', 'false')
})

document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape') {
    moreMenuDropdown.hidden = true
    networkMoreButton.setAttribute('aria-expanded', 'false')
  }
})

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
