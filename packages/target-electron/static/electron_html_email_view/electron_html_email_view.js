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

window.htmlview
  .getMenuLabels()
  .then(({ load_remote_content, more_options }) => {
    loadRemoteContentBtn.textContent = load_remote_content
    // The button's only content is "⋮", which on its own is not a usable name.
    networkMoreButton.setAttribute('aria-label', more_options)
  })

const menuItems = () =>
  Array.from(moreMenuDropdown.querySelectorAll('[role="menuitem"]'))

function openMenu(focusLast = false) {
  moreMenuDropdown.hidden = false
  networkMoreButton.setAttribute('aria-expanded', 'true')
  const items = menuItems()
  const item = focusLast ? items[items.length - 1] : items[0]
  if (item) {
    item.focus()
  }
}

function closeMenu(returnFocus = false) {
  if (moreMenuDropdown.hidden) {
    return
  }
  moreMenuDropdown.hidden = true
  networkMoreButton.setAttribute('aria-expanded', 'false')
  if (returnFocus) {
    networkMoreButton.focus()
  }
}

networkMoreButton.onclick = ev => {
  ev.stopPropagation()
  if (moreMenuDropdown.hidden) {
    openMenu()
  } else {
    closeMenu()
  }
}

loadRemoteContentBtn.onclick = () => {
  closeMenu(true)
  window.htmlview.triggerLoadRemoteContent()
}

document.addEventListener('click', () => closeMenu())

document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape') {
    if (!moreMenuDropdown.hidden) {
      ev.preventDefault()
      closeMenu(true)
    }
    return
  }

  const isArrow = ev.key === 'ArrowDown' || ev.key === 'ArrowUp'

  if (moreMenuDropdown.hidden) {
    // `role="menu"` promises arrow key operation, so open on arrow keys too.
    if (isArrow && document.activeElement === networkMoreButton) {
      ev.preventDefault()
      openMenu(ev.key === 'ArrowUp')
    }
    return
  }

  if (isArrow) {
    ev.preventDefault()
    const items = menuItems()
    const offset = ev.key === 'ArrowDown' ? 1 : items.length - 1
    const index = items.indexOf(document.activeElement)
    const next = items[(Math.max(index, 0) + offset) % items.length]
    if (next) {
      next.focus()
    }
  } else if (ev.key === 'Tab') {
    closeMenu()
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
