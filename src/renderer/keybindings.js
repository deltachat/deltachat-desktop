function selectFirstChatListItem() {
  let chatItemToSelect = document.querySelector('.chat-list-item')
  if (chatItemToSelect.classList.contains('chat-list-item--is-deaddrop')) {
    chatItemToSelect = chatItemToSelect.nextSibling
  }
  chatItemToSelect.click()
}

function selectChatItem(domChatItem) {
  if (domChatItem.classList.contains('chat-list-item--is-deaddrop')) return
  domChatItem.click()
  domChatItem.scrollIntoView({block: 'nearest'})
  document.querySelector('#composer-textarea').focus()
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
      chatListSearch.value = ''
      chatListSearch.focus()
    }
  });
}

