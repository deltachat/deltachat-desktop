import { MessageType } from '../../shared/shared-types'
import { OrderedMap } from 'immutable'
import { DeltaBackend } from '../delta-remote'

export const PAGE_SIZE = 11

let pseudo_random_revision_number = 0

export class MessagePage {
  /** increase this number when sth changed, it gets used by the react memo */
  rev = 0
  constructor(
    public pageKey: string,
    public messages: OrderedMap<number, MessageType | null>
  ) {
    // Initialise revision counter to a "random" start value,
    // so that re-creation of a page does not cheat the system
    this.rev = pseudo_random_revision_number++
  }

  deleteMessage(msgId: number) {
    if (this.messages.has(msgId)) {
      this.messages = this.messages.withMutations(messages => {
        messages.set(msgId, null)
      })
      this.rev++
    }
  }

  messagesChanged(messagesChanged: MessageType[]) {
    let did_sth_change = false
    this.messages = this.messages.withMutations(messages => {
      for (const changedMessage of messagesChanged) {
        if (!messages.has(changedMessage.id)) {
          continue
        }
        messages.set(changedMessage.id, changedMessage)
        did_sth_change = true
      }
    })
    if (did_sth_change) {
      this.rev++
    }
  }

  setMessageState(messageId: number, messageState: number) {
    if (this.messages.has(messageId)) {
      const message = this.messages.get(messageId)
      if (message !== null && message !== undefined) {
        this.messages = this.messages.withMutations(messages => {
          messages.set(messageId, {
            ...message,
            state: messageState,
          })
        })

        this.rev++
      }
    }
  }

  static async messagePageFromMessageIndexes(
    chatId: number,
    indexStart: number,
    indexEnd: number
  ) {
    const _messages = await DeltaBackend.call(
      'messageList.getMessagesFromIndex',
      chatId,
      indexStart,
      indexEnd
    )
    if (_messages.length === 0) {
      throw new Error(
        'messagePageFromMessageIndexes: _messages.length equals zero. This should not happen'
      )
    }

    if (_messages.length !== indexEnd - indexStart + 1) {
      throw new Error(
        "messagePageFromMessageIndexes: _messages.length doesn't equal indexEnd - indexStart + 1. This should not happen"
      )
    }

    const messages = OrderedMap().withMutations(messagePages => {
      for (let i = 0; i < _messages.length; i++) {
        const [messageId, message] = _messages[i]
        messagePages.set(messageId, message)
      }
    }) as OrderedMap<number, MessageType | null>

    const messagePage = new MessagePage(
      calculatePageKey(messages, indexStart, indexEnd),
      messages
    )

    return messagePage
  }

  static async messagePagesFromMessageIndexes(
    chatId: number,
    indexStart: number,
    indexEnd: number
  ) {
    const _messages = await DeltaBackend.call(
      'messageList.getMessagesFromIndex',
      chatId,
      indexStart,
      indexEnd
    )

    const messagePages = []

    let currentIndex = 0
    while (currentIndex < _messages.length) {
      const messages = OrderedMap().withMutations(messagePages => {
        for (let i = currentIndex; i < currentIndex + PAGE_SIZE; i++) {
          if (i >= _messages.length) break
          const [messageId, message] = _messages[i]
          messagePages.set(messageId, message)
        }
      }) as OrderedMap<number, MessageType | null>
      currentIndex = currentIndex + PAGE_SIZE

      const messagePage = new MessagePage(
        calculatePageKey(messages, indexStart, indexEnd),
        messages
      )

      messagePages.push(messagePage)
    }

    return messagePages
  }
}

function calculatePageKey(
  messages: OrderedMap<number, MessageType | null>,
  indexStart: number,
  indexEnd: number
): string {
  const first = messages.find(
    message => message !== null && message !== undefined
  )
  const last = messages.findLast(
    message => message !== null && message !== undefined
  )
  let firstId = 0
  if (first) {
    firstId = first.id
  }
  let lastId = 0
  if (last) {
    lastId = last.id
  }
  if (firstId + lastId + indexStart + indexEnd === 0) {
    throw new Error('calculatePageKey: non unique page key of 0')
  }
  return `page-${firstId}-${lastId}-${indexStart}-${indexEnd}`
}
