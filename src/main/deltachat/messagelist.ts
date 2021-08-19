import { C } from 'deltachat-node'
import { getLogger } from '../../shared/logger'

const log = getLogger('main/deltachat/messagelist')

import SplitOut from './splitout'
import { Message } from 'deltachat-node'
import { MessageType, MessageSearchResult } from '../../shared/shared-types'

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
  ): [number, MessageType | null] {
    const viewType = filename ? C.DC_MSG_FILE : C.DC_MSG_TEXT
    const msg = this.selectedAccountContext.messageNew(viewType)
    if (filename) msg.setFile(filename, undefined)
    if (text) msg.setText(text)
    if (location) msg.setLocation(location.lat, location.lng)

    if (quoteMessageId) {
      const quotedMessage = this.selectedAccountContext.getMessage(quoteMessageId)
      if (!quotedMessage) {
        log.error('sendMessage: Message to quote not found')
      } else {
        msg.setQuote(quotedMessage)
      }
    }

    const messageId = this.selectedAccountContext.sendMessage(chatId, msg)
    return [messageId, this.getMessage(messageId)]
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

  async getDraft(chatId: number): Promise<MessageType | null> {
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
      const quotedMessage = this.selectedAccountContext.getMessage(quotedMessageId)
      if (!quotedMessage) {
        log.error('setDraftquote: Message to quote not found')
      } else {
        draft.setQuote(quotedMessage)
      }
    }

    this.selectedAccountContext.setDraft(chatId, draft)
  }

  messageIdToJson(id: number): MessageType | null {
    const msg = this.selectedAccountContext.getMessage(id)
    if (!msg) {
      log.warn('No message found for ID ' + id)
      return null
    }
    return this._messageToJson(msg)
  }

  _messageToJson(msg: Message): MessageType {
    const file_mime = msg.getFilemime()
    const file_name = msg.getFilename()
    const file_bytes = msg.getFilebytes()
    const fromId = msg.getFromId()
    const setupCodeBegin = msg.getSetupcodebegin()
    const contact = fromId && this.controller.contacts.getContact(fromId)

    const jsonMSG = msg.toJson()

    return Object.assign(jsonMSG, {
      sender: (contact ? { ...contact } : {}) as any,
      setupCodeBegin,
      // extra attachment fields
      file_mime,
      file_bytes,
      file_name,
    })
  }

  forwardMessage(msgId: number, chatId: number) {
    this.selectedAccountContext.forwardMessages([msgId], chatId)
    this.controller.chatList.selectChat(chatId)
  }

  getMessageIds(chatId: number, flags: number = C.DC_GCM_ADDDAYMARKER) {
    const messageIds = this.selectedAccountContext.getChatMessages(chatId, flags, 0)
    return messageIds
  }

  getMessages(messageIds: number[]) {
    const messages: {
      [key: number]: ReturnType<typeof DCMessageList.prototype.messageIdToJson>
    } = {}
    const markMessagesRead: number[] = []
    messageIds.forEach(messageId => {
      if (messageId <= C.DC_MSG_ID_LAST_SPECIAL) return
      const message = this.messageIdToJson(messageId)
      if (
        getDirection(message) === 'incoming' &&
        message.state !== C.DC_STATE_IN_SEEN
      ) {
        markMessagesRead.push(messageId)
      }
      messages[messageId] = message
    })

    if (markMessagesRead.length > 0) {
      const chatId = messages[markMessagesRead[0]].chatId

      log.debug(
        `markMessagesRead ${markMessagesRead.length} messages for chat ${chatId}`
      )
      // TODO: move mark seen logic to frontend
      setTimeout(() => this.selectedAccountContext.markSeenMessages(markMessagesRead))
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
    const message_html_content = this.selectedAccountContext.getMessageHTML(messageId)
    const pathToFile = tempy.file({ extension: 'html' })
    await writeFile(pathToFile, message_html_content, { encoding: 'utf-8' })
    return pathToFile
  }
}
