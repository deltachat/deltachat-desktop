import { C, Message as DCNMessage } from 'deltachat-node'
import { getLogger } from '../../shared/logger'

const log = getLogger('main/deltachat/messagelist')

// @ts-ignore
import binding from 'deltachat-node/binding'
import SplitOut from './splitout'
import { NormalMessage, MessageSearchResult, MetaMessageIs, MarkerOneParams, MetaMessage, MessageQuote } from '../../shared/shared-types'

import { writeFile } from 'fs/promises'
import tempy from 'tempy'

import { getDirection } from '../../shared/util'
export default class DCMessageList extends SplitOut {
  sendMessage(
    chatId: number,
    {
      text,
      filename,
      location,
      quoteMessageId,
    }: {
      text?: string
      filename?: string
      location?: { lat: number; lng: number }
      quoteMessageId?: number
    }
  ): [number, NormalMessage | null] {
    const viewType = filename ? C.DC_MSG_FILE : C.DC_MSG_TEXT
    const msg = this.selectedAccountContext.messageNew(viewType)
    if (filename) msg.setFile(filename, undefined)
    if (text) msg.setText(text)
    if (location) msg.setLocation(location.lat, location.lng)

    if (quoteMessageId) {
      const quotedMessage = this.selectedAccountContext.getMessage(
        quoteMessageId
      )
      if (!quotedMessage) {
        log.error('sendMessage: Message to quote not found')
      } else {
        msg.setQuote(quotedMessage)
      }
    }

    const messageId = this.selectedAccountContext.sendMessage(chatId, msg)

    const _msg: DCNMessage = this.selectedAccountContext.getMessage(messageId)
    const message = _msg ? this._messageToJson(_msg) : null
    return [messageId, message]
  }

  sendSticker(chatId: number, fileStickerPath: string) {
    const viewType = C.DC_MSG_STICKER
    const msg = this.selectedAccountContext.messageNew(viewType)
    const stickerPath = fileStickerPath.replace('file://', '')
    msg.setFile(stickerPath, undefined)
    this.selectedAccountContext.sendMessage(chatId, msg)
  }

  deleteMessage(id: number) {
    log.info(`deleting messages ${id}`)
    this.selectedAccountContext.deleteMessages([id])
  }

  getMessage(msgId: number) {
    return this.messageIdToJson(msgId)
  }

  getMessageInfo(msgId: number) {
    return this.selectedAccountContext.getMessageInfo(msgId)
  }
  
  // TODO: Port to core
  getFirstUnreadMessageId(chatId: number) {
    const countFreshMessages = this.selectedAccountContext.getFreshMessageCount(chatId)
    const messageIds = this.selectedAccountContext.getChatMessages(chatId, 0, 0)

    let foundFreshMessages = 0
    let firstUnreadMessageId = -1
    for (let i = messageIds.length - 1; i >= 0; i--) {
      const messageId = messageIds[i]

      if (!this.selectedAccountContext.getMessage(messageId).getState().isFresh()) continue

      foundFreshMessages++
      firstUnreadMessageId = messageId

      if (foundFreshMessages >= countFreshMessages) {
        break
      }
    }

    return firstUnreadMessageId
  }

  // TODO: Port to core
  getUnreadMessageIds(chatId: number) {
    const countFreshMessages = this.selectedAccountContext.getFreshMessageCount(chatId)
    log.debug(`getUnreadMessageIds: countFreshMessages: ${countFreshMessages}`)
    if (countFreshMessages === 0) return []

    const messageIds = this.selectedAccountContext.getChatMessages(chatId, 0, 0)

    let foundFreshMessages = 0
    const unreadMessageIds: number[] = []
    for (let i = messageIds.length - 1; i >= 0; i--) {
      const messageId = messageIds[i]

      const state = this.selectedAccountContext.getMessage(messageId).getState().state
      const isFresh =
        state === C.DC_STATE_IN_FRESH || state === C.DC_STATE_IN_NOTICED
      log.debug(
        `getUnreadMessageIds: messageId: ${messageId} isFresh: ${isFresh}`
      )
      if (!isFresh) continue

      foundFreshMessages++
      unreadMessageIds.unshift(messageId)

      if (foundFreshMessages >= countFreshMessages) {
        break
      }
    }

    return unreadMessageIds
  }

  async getDraft(chatId: number): Promise<NormalMessage | null> {
    const draft = this.selectedAccountContext.getDraft(chatId)
    return draft ? this._messageToJson(draft) : null
  }

  setDraft(
    chatId: number,
    {
      text,
      file,
      quotedMessageId,
    }: { text?: string; file?: string; quotedMessageId?: number }
  ) {
    const viewType = file ? C.DC_MSG_FILE : C.DC_MSG_TEXT
    const draft = this.selectedAccountContext.messageNew(viewType)
    if (file) draft.setFile(file, undefined)
    if (text) draft.setText(text)
    if (quotedMessageId) {
      const quotedMessage = this.selectedAccountContext.getMessage(
        quotedMessageId
      )
      if (!quotedMessage) {
        log.error('setDraftquote: Message to quote not found')
      } else {
        draft.setQuote(quotedMessage)
      }
    }

    this.selectedAccountContext.setDraft(chatId, draft)
  }

  messageIdToJson(id: number): NormalMessage | null {
    const msg = this.selectedAccountContext.getMessage(id)
    if (!msg) {
      log.warn('No message found for ID ' + id)
      return null
    }
    return this._messageToJson(msg)
  }

  _messageToJson(msg: DCNMessage): NormalMessage {
    const file_mime = msg.getFilemime()
    const file_name = msg.getFilename()
    const file_bytes = msg.getFilebytes()
    const fromId = msg.getFromId()
    const setupCodeBegin = msg.getSetupcodebegin()
    const contact = fromId && this.controller.contacts.getContact(fromId)

    const jsonMSG: ReturnType<typeof DCNMessage.prototype.toJson>  = msg.toJson()

    let quote: MessageQuote = null
    const quotedMessage = msg.getQuotedMessage()
    if (quotedMessage) {
      const _contact = this.selectedAccountContext.getContact(quotedMessage.getFromId())
      quote = {
        messageId: quotedMessage.getId(),
        text: quotedMessage.getText(),
        displayName: _contact.getDisplayName(),
        displayColor: _contact.color,
        overrideSenderName: quotedMessage.overrideSenderName,
      }
    }
    return {
      ...jsonMSG,
      type: MetaMessageIs.Normal,
      sender: (contact ? { ...contact } : {}) as any,
      setupCodeBegin,
      // extra attachment fields
      file_mime,
      file_bytes,
      file_name,
      quote
    }
  }

  forwardMessage(msgId: number, chatId: number) {
    this.selectedAccountContext.forwardMessages([msgId], chatId)
    this.controller.chatList.selectChat(chatId)
  }

  getMessageIds(
    chatId: number,
    markerOne: MarkerOneParams = {},
    flags: number = C.DC_GCM_ADDDAYMARKER
  ) {
    log.debug(
      `getMessageIds: chatId: ${chatId} markerOne: ${JSON.stringify(markerOne)}`
    )
    const messageIds = []

    for (const messageId of this.selectedAccountContext.getChatMessages(chatId, flags, 0)) {
      if (markerOne && markerOne[messageId]) {
        messageIds.push(C.DC_MSG_ID_MARKER1)
      }
      messageIds.push(messageId)
    }
    return messageIds
  }

 // TODO: move to nodebindings
  async getMessages(
    chatId: number,
    indexStart: number,
    indexEnd: number,
    markerOne: MarkerOneParams = {},
    flags: number = C.DC_GCM_ADDDAYMARKER
  ): Promise<MetaMessage[]> {
    log.debug(
      `getMessages: chatId: ${chatId} markerOne: ${JSON.stringify(markerOne)}`
    )
    const messageIds = this.getMessageIds(chatId, markerOne, flags)
    console.log(messageIds)

    if (indexEnd === -1) indexEnd = messageIds.length - 1

    const messages: MetaMessage[] = []
    for (
      let messageIndex = indexStart;
      messageIndex <= indexEnd;
      messageIndex++
    ) {
      const messageId = messageIds[messageIndex]

      let messageObject: MetaMessage = null
      if (messageId == C.DC_MSG_ID_DAYMARKER) {
        const nextMessageIndex = messageIndex + 1
        const nextMessageId = messageIds[nextMessageIndex]
        const nextMessageTimestamp = this.selectedAccountContext
          .getMessage(nextMessageId)
          .getTimestamp()
        messageObject = {
          type: MetaMessageIs.DayMarker,
          timestamp: nextMessageTimestamp,
        }
      } else if (messageId === C.DC_MSG_ID_MARKER1) {
        messageObject = {
          type: MetaMessageIs.MarkerOne,
          count: markerOne[messageIds[messageIndex + 1]],
        }
      } else if (messageId <= C.DC_MSG_ID_LAST_SPECIAL) {
        log.debug(
          `getMessages: not sure what do with this messageId: ${messageId}, skipping`
        )
      } else {
        const msg = this.selectedAccountContext.getMessage(messageId)
        if (!msg) {
          continue
        }
        const message = this._messageToJson(msg)
        messageObject = message
      }
      messages.push(messageObject)
    }
    return messages
  }

  markSeenMessages(messageIds: number[]) {
    this.selectedAccountContext.markSeenMessages(messageIds)
  }

  searchMessages(query: string, chatId = 0): number[] {
    return this.selectedAccountContext.searchMessages(chatId, query)
  }

  private _msgId2SearchResultItem(msgId: number): MessageSearchResult {
    const message = this.selectedAccountContext.getMessage(msgId)
    const chat = this.selectedAccountContext.getChat(message.getChatId())
    const author = this.selectedAccountContext.getContact(message.getFromId())

    return {
      id: msgId,
      authorProfileImage: author.getProfileImage(),
      author_name: author.getDisplayName(),
      author_color: author.color,
      chat_name: chat.isSingle() ? null : chat.getName(),
      message: message.getText(),
      timestamp: message.getTimestamp(),
    }
  }

  msgIds2SearchResultItems(ids: number[]) {
    const result: { [id: number]: MessageSearchResult } = {}
    for (const id of ids) {
      result[id] = this._msgId2SearchResultItem(id)
    }
    return result
  }

  /** @returns file path to html file */
  async saveMessageHTML2Disk(messageId: number): Promise<string> {
    const message_html_content = this.selectedAccountContext.getMessageHTML(
      messageId
    )
    const pathToFile = tempy.file({ extension: 'html' })
    await writeFile(pathToFile, message_html_content, { encoding: 'utf-8' })
    return pathToFile
  }
}
