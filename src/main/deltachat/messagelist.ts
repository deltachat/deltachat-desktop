import { C } from 'deltachat-node'
import { getLogger } from '../../shared/logger'

const log = getLogger('main/deltachat/messagelist')

import SplitOut from './splitout'
import { Message } from 'deltachat-node'
import {
  MessageType,
  MessageSearchResult,
  MessageQuote,
} from '../../shared/shared-types'

import { mkdtemp, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

export default class DCMessageList extends SplitOut {
  sendSticker(chatId: number, fileStickerPath: string) {
    const viewType = C.DC_MSG_STICKER
    const msg = this.selectedAccountContext.messageNew(viewType)
    const stickerPath = fileStickerPath.replace('file://', '')
    msg.setFile(stickerPath, undefined)
    this.selectedAccountContext.sendMessage(chatId, msg)
  }

  downloadFullMessage(msgId: number) {
    return this.selectedAccountContext.downloadFullMessage(msgId)
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

    let quote: MessageQuote | null = null
    const quoteText = msg.getQuotedText()
    if (quoteText) {
      const quotedMessage = msg.getQuotedMessage()
      let message = null
      if (quotedMessage) {
        const contact = this.selectedAccountContext.getContact(
          quotedMessage.getFromId()
        )
        if (!contact) {
          throw new Error('quote author contact is undefined')
        }
        message = {
          messageId: quotedMessage.getId(),
          displayName: contact.getDisplayName(),
          displayColor: contact.color,
          overrideSenderName: quotedMessage.overrideSenderName,
          image:
            quotedMessage.getViewType().isImage() ||
            quotedMessage.getViewType().isGif()
              ? quotedMessage.getFile()
              : null,
          isForwarded: quotedMessage.isForwarded(),
        }
      }
      quote = {
        text: quoteText,
        message,
      }
    }

    return Object.assign(jsonMSG, {
      sender: (contact ? { ...contact } : {}) as any,
      setupCodeBegin,
      // extra attachment fields
      file_mime,
      file_bytes,
      file_name,
      quote,
    })
  }

  searchMessages(query: string, chatId = 0): number[] {
    return this.selectedAccountContext.searchMessages(chatId, query)
  }

  private _msgId2SearchResultItem(msgId: number): MessageSearchResult | null {
    const message = this.selectedAccountContext.getMessage(msgId)
    if (!message) {
      log.warn('search: message not found: msg_id ', msgId)
      return null
    }
    const chat = this.selectedAccountContext.getChat(message.getChatId())
    const author = this.selectedAccountContext.getContact(message.getFromId())
    if (!chat || !author) {
      log.warn('search: chat or author of message not found: msg_id ', msgId)
      return null
    }
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
      const item = this._msgId2SearchResultItem(id)
      if (item) {
        result[id] = item
      }
    }
    return result
  }

  /** @returns file path to html file */
  async saveMessageHTML2Disk(messageId: number): Promise<string> {
    const message_html_content = this.selectedAccountContext.getMessageHTML(
      messageId
    )
    const tmpDir = await mkdtemp(join(tmpdir(), 'deltachat-'))
    const pathToFile = join(tmpDir, 'message.html')
    await writeFile(pathToFile, message_html_content, { encoding: 'utf-8' })
    return pathToFile
  }
}
