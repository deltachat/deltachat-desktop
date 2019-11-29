function selectFirstChatListItem() {
  let chatItemToSelect = document.querySelector('.chat-list-item')
  if (chatItemToSelect.classList.contains('chat-list-item--is-deaddrop')) {
    chatItemToSelect = chatItemToSelect.nextSibling
  }
  selectChatItem(chatItemToSelect)
}

function selectChatItem(domChatItem) {
  if (domChatItem.classList.contains('chat-list-item--is-deaddrop')) return
  domChatItem.click()
  domChatItem.scrollIntoView({block: 'nearest'})
  setTimeout(() => document.querySelector('#composer-textarea').focus(), 300)
}

function scrollSelectedChatItemIntoView() {
  let selectedChatItem = document.querySelector('.chat-list-item--is-selected')
  if (selectedChatItem) selectedChatItem.scrollIntoView({block: 'nearest'})
}

function setSearchInputValue(value) {
    const chatListSearch = document.querySelector('#chat-list-search')
    var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(chatListSearch, value);
    var ev2 = new Event('input', { bubbles: true});
    chatListSearch.dispatchEvent(ev2);
}   

export default function attachKeybindingsListener () {
  document.addEventListener ("keydown", function (Event) {
    if (Event.altKey  &&  Event.key === "ArrowDown") {
      const selectedChatItems = document.getElementsByClassName('chat-list-item--is-selected')
      if (selectedChatItems.length == 0) return selectFirstChatListItem()
      const nextChatItem = selectedChatItems[0].nextSibling
      selectChatItem(nextChatItem)
    } else if(Event.altKey && Event.key === 'ArrowUp') {
      const selectedChatItems = document.getElementsByClassName('chat-list-item--is-selected')
      if (selectedChatItems.length == 0) return selectFirstChatListItem()
      const previousChatItem = selectedChatItems[0].previousSibling
      selectChatItem(previousChatItem)
    } else if(Event.ctrlKey && Event.key === 'k') {
      const chatListSearch = document.querySelector('#chat-list-search')
      setSearchInputValue('')
      chatListSearch.focus()
    } else if(Event.key === 'Escape' && Event.target.id === 'chat-list-search') {
      setSearchInputValue('')
      document.querySelector('#composer-textarea').focus()
      setTimeout(() => scrollSelectedChatItemIntoView(), 300)
    } else if(Event.key === 'Enter' && Event.target.id === 'chat-list-search') {
      Event.preventDefault()
      selectFirstChatListItem()
      setSearchInputValue('')
      setTimeout(() => scrollSelectedChatItemIntoView(), 300)
    }
  });
}

