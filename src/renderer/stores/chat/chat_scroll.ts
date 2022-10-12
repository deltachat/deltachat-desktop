type ScrollTo =
  | ScrollToMessage
  | ScrollToPosition
  | ScrollToLastKnownPosition
  | ScrollToBottom
  | null

interface ScrollToMessage {
  type: 'scrollToMessage'
  msgId: number
  highlight: boolean
}

interface ScrollToLastKnownPosition {
  type: 'scrollToLastKnownPosition'
  lastKnownScrollHeight: number
  lastKnownScrollTop: number
  appendedOn: 'top' | 'bottom'
}

interface ScrollToPosition {
  type: 'scrollToPosition'
  scrollTop: number
}

interface ScrollToBottom {
  type: 'scrollToBottom'
  /** toggle proximity check, if on scroll only if close */
  ifClose: boolean
}

export class ChatViewState {
  scrollTo: ScrollTo = null
  lastKnownScrollHeight = -1

  refresh() {
    // keep scroll position
    const { lastKnownScrollTop } = getLastKnownScrollPosition()
    this.scrollTo = {
      type: 'scrollToPosition',
      scrollTop: lastKnownScrollTop,
    }

    return this
  }

  appendMessagePageTop() {
    const {
      lastKnownScrollHeight,
      lastKnownScrollTop,
    } = getLastKnownScrollPosition()

    this.scrollTo = {
      type: 'scrollToLastKnownPosition',
      lastKnownScrollHeight,
      lastKnownScrollTop,
      appendedOn: 'top',
    }

    return this
  }

  appendMessagePageBottom() {
    const {
      lastKnownScrollHeight,
      lastKnownScrollTop,
    } = getLastKnownScrollPosition()

    this.scrollTo = {
      type: 'scrollToLastKnownPosition',
      lastKnownScrollTop,
      lastKnownScrollHeight,
      appendedOn: 'bottom',
    }

    return this
  }

  fetchedIncomingMessages() {
    const {
      lastKnownScrollHeight,
      // lastKnownScrollTop,
    } = getLastKnownScrollPosition()

    this.scrollTo = {
      type: 'scrollToBottom',
      ifClose: true,
    }

    this.lastKnownScrollHeight = lastKnownScrollHeight
    //this.lastKnownScrollTop = lastKnownScrollTop

    return this
  }

  unlockScroll() {
    this.scrollTo = null
    this.lastKnownScrollHeight = -1

    return this
  }

  messageSent() {
    this.scrollTo = {
      type: 'scrollToBottom',
      ifClose: false,
    }

    return this
  }

  setMessageListItems() {
    const {
      lastKnownScrollHeight,
      lastKnownScrollTop,
    } = getLastKnownScrollPosition()

    this.scrollTo = {
      type: 'scrollToLastKnownPosition',
      lastKnownScrollHeight,
      lastKnownScrollTop,
      appendedOn: 'top',
    }

    return this
  }

  selectChat() {
    this.scrollTo = {
      type: 'scrollToBottom',
      ifClose: false,
    }

    return this
  }

  jumpToMessage(jumpToMessageId: number, highlight: boolean) {
    this.scrollTo = {
      type: 'scrollToMessage',
      msgId: jumpToMessageId,
      highlight,
    }

    return this
  }
}

function getLastKnownScrollPosition(): {
  lastKnownScrollHeight: number
  lastKnownScrollTop: number
} {
  //@ts-ignore
  const { scrollHeight, scrollTop } = document.querySelector('#message-list')
  return {
    lastKnownScrollHeight: scrollHeight,
    lastKnownScrollTop: scrollTop,
  }
}
