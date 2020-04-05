function selectFirstChatListItem() {
  let chatItemToSelect = document.querySelector<HTMLElement>('.chat-list-item')
  if (chatItemToSelect.classList.contains('chat-list-item--is-deaddrop')) {
    chatItemToSelect = chatItemToSelect.nextSibling as HTMLElement
  }
  selectChatItem(chatItemToSelect)
}

function selectChatItem(domChatItem: HTMLElement) {
  if (domChatItem.classList.contains('chat-list-item--is-deaddrop')) return
  domChatItem.click()
  domChatItem.scrollIntoView({ block: 'nearest' })
  setTimeout(
    () => document.querySelector<HTMLElement>('#composer-textarea').focus(),
    300
  )
}

function scrollSelectedChatItemIntoView() {
  const selectedChatItem = document.querySelector(
    '.chat-list-item--is-selected'
  )
  if (selectedChatItem) selectedChatItem.scrollIntoView({ block: 'nearest' })
}

function setSearchInputValue(value: string) {
  const chatListSearch = document.querySelector('#chat-list-search')
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  ).set
  nativeInputValueSetter.call(chatListSearch, value)
  const ev2 = new Event('input', { bubbles: true }) // eslint-disable-line
  chatListSearch.dispatchEvent(ev2)
}

export default function attachKeybindingsListener() {
  document.addEventListener('keydown', function(Event) {
    // only listen to those events when logged in
    if (!window.__isReady) return

    if (Event.altKey && Event.key === 'ArrowDown') {
      const selectedChatItems = document.getElementsByClassName(
        'chat-list-item--is-selected'
      )
      if (selectedChatItems.length === 0) return selectFirstChatListItem()
      const nextChatItem = selectedChatItems[0].nextSibling as HTMLElement
      selectChatItem(nextChatItem)
    } else if (Event.altKey && Event.key === 'ArrowUp') {
      const selectedChatItems = document.getElementsByClassName(
        'chat-list-item--is-selected'
      )
      if (selectedChatItems.length === 0) return selectFirstChatListItem()
      const previousChatItem = selectedChatItems[0]
        .previousSibling as HTMLElement
      selectChatItem(previousChatItem)
    } else if (Event.ctrlKey && Event.key === 'k') {
      const chatListSearch = document.querySelector<HTMLElement>(
        '#chat-list-search'
      )
      setSearchInputValue('')
      chatListSearch.focus()
    } else if (Event.ctrlKey && Event.key === 'n') {
      document.querySelector<HTMLElement>('#composer-textarea').focus()
    } else if (Event.ctrlKey && Event.key === ',') {
      // open settings
      if (window.__openDialog) {
        window.__openDialog('Settings')
      }
    } else if (
      Event.key === 'Escape' &&
      (Event.target as any).id === 'chat-list-search'
    ) {
      setSearchInputValue('')
      document.querySelector<HTMLElement>('#composer-textarea').focus()
      setTimeout(() => scrollSelectedChatItemIntoView(), 300)
    } else if (
      Event.key === 'Enter' &&
      (Event.target as any).id === 'chat-list-search'
    ) {
      Event.preventDefault()
      selectFirstChatListItem()
      setSearchInputValue('')
      setTimeout(() => scrollSelectedChatItemIntoView(), 300)
    }
  })
}
