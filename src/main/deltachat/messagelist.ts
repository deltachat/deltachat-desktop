import { C, Message as MessageNode } from 'deltachat-node'

// @ts-ignore
import binding from 'deltachat-node/binding'
import { getLogger } from '../../shared/logger'

const log = getLogger('main/deltachat/messagelist')

import filesizeConverter from 'filesize'
import mime from 'mime-types'

import SplitOut from './splitout'
import {
  Message,
  MessageSearchResult,
  MessageAttachment,
  MessageType,
  MessageQuote,
  MessageTypeIs,
  MarkerOneParams,
} from '../../shared/shared-types'

import { writeFile } from 'fs-extra'
import tempy from 'tempy'
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
  ): [number, MessageType] {
    const viewType = filename ? C.DC_MSG_FILE : C.DC_MSG_TEXT
    const msg = this._dc.messageNew(viewType)
    if (filename) msg.setFile(filename, undefined)
    if (text) msg.setText(text)
    if (location) msg.setLocation(location.lat, location.lng)

    if (quoteMessageId) {
      const quotedMessage = this._dc.getMessage(quoteMessageId)
      if (!quotedMessage) {
        log.error('sendMessage: Message to quote not found')
      } else {
        msg.setQuote(quotedMessage)
      }
    }

    const messageId = this._dc.sendMessage(chatId, msg)
    const _msg: MessageNode = this._dc.getMessage(messageId)
    const message = _msg ? this._messageToJson(_msg) : null
    return [messageId, message]
  }

  sendSticker(chatId: number, fileStickerPath: string) {
    const viewType = C.DC_MSG_STICKER
    const msg = this._dc.messageNew(viewType)
    const stickerPath = fileStickerPath.replace('file://', '')
    msg.setFile(stickerPath, undefined)
    this._dc.sendMessage(chatId, msg)
  }

  deleteMessage(id: number) {
    log.info(`deleting messages ${id}`)
    this._dc.deleteMessages([id])
  }

  getMessage(msgId: number) {
    return this.messageIdToJson(msgId)
  }

  getMessageInfo(msgId: number) {
    return this._dc.getMessageInfo(msgId)
  }

  // TODO: Port to core
  getFirstUnreadMessageId(chatId: number) {
    const countFreshMessages = this._dc.getFreshMessageCount(chatId)
    const messageIds = this._dc.getChatMessages(chatId, 0, 0)

    let foundFreshMessages = 0
    let firstUnreadMessageId = -1
    for (let i = messageIds.length - 1; i >= 0; i--) {
      const messageId = messageIds[i]

      if (!this._dc.getMessage(messageId).getState().isFresh()) continue

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
    const countFreshMessages = this._dc.getFreshMessageCount(chatId)
    log.debug(`getUnreadMessageIds: countFreshMessages: ${countFreshMessages}`)
    if (countFreshMessages === 0) return []

    const messageIds = this._dc.getChatMessages(chatId, 0, 0)

    let foundFreshMessages = 0
    const unreadMessageIds: number[] = []
    for (let i = messageIds.length - 1; i >= 0; i--) {
      const messageId = messageIds[i]

      const state = this._dc.getMessage(messageId).getState().state
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

  async getDraft(chatId: number): Promise<Message> {
    const draft = this._dc.getDraft(chatId)
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
    const draft = this._dc.messageNew(viewType)
    if (file) draft.setFile(file, undefined)
    if (text) draft.setText(text)
    if (quotedMessageId) {
      const quotedMessage = this._dc.getMessage(quotedMessageId)
      if (!quotedMessage) {
        log.error('setDraftquote: Message to quote not found')
      } else {
        draft.setQuote(quotedMessage)
      }
    }

    this._dc.setDraft(chatId, draft)
  }

  messageIdToJson(id: number) {
    const msg = this._dc.getMessage(id)
    if (!msg) {
      log.warn('No message found for ID ' + id)
      const empty: { msg: null } = { msg: null }
      return empty
    }
    return this._messageToJson(msg)
  }

  _messageToJson(msg: MessageNode): Message {
    const file = msg.getFile()
    const filemime = msg.getFilemime()
    const filename = msg.getFilename()
    const filesize = msg.getFilebytes()
    const viewType = msg.getViewType()
    const fromId = msg.getFromId()
    const isMe = fromId === C.DC_CONTACT_ID_SELF
    const setupCodeBegin = msg.getSetupcodebegin()
    const contact = fromId && this._controller.contacts.getContact(fromId)
    const direction = (isMe ? 'outgoing' : 'incoming') as
      | 'outgoing'
      | 'incoming'

    const attachment: MessageAttachment = file && {
      url: file,
      contentType: convertContentType({
        filemime,
        viewType: (viewType as unknown) as number,
        file: file,
      }),
      fileName: filename || msg.getText(),
      fileSize: filesizeConverter(filesize),
    }

    let quote: MessageQuote = null
    const quotedMessage = msg.getQuotedMessage()
    if (quotedMessage) {
      const _contact = this._dc.getContact(quotedMessage.getFromId())
      quote = {
        messageId: quotedMessage.getId(),
        text: quotedMessage.getText(),
        displayName: _contact.getDisplayName(),
        displayColor: _contact.color,
        overrideSenderName: quotedMessage.overrideSenderName,
      }
    }

    return {
      type: MessageTypeIs.Message,
      id: msg.getId(),
      chatId: msg.getChatId(),
      duration: msg.getDuration(),
      file: msg.getFile(),
      fromId: msg.getFromId(),
      quote,
      receivedTimestamp: msg.getReceivedTimestamp(),
      sortTimestamp: msg.getSortTimestamp(),
      text: msg.getText(),
      timestamp: msg.getTimestamp(),
      hasLocation: msg.hasLocation(),
      viewType: binding.dcn_msg_get_viewtype(msg.dc_msg),
      state: binding.dcn_msg_get_state(msg.dc_msg),
      hasDeviatingTimestamp: msg.hasDeviatingTimestamp(),
      showPadlock: msg.getShowpadlock(),
      summary: msg.getSummary().toJson(),
      isSetupmessage: msg.isSetupmessage(),
      isInfo: msg.isInfo(),
      isForwarded: msg.isForwarded(),
      dimensions: {
        height: msg.getHeight(),
        width: msg.getWidth(),
      },
      videochatType: msg.getVideochatType(),
      videochatUrl: msg.getVideochatUrl(),
      sentAt: msg.getTimestamp() * 1000,
      receivedAt: msg.getReceivedTimestamp() * 1000,
      direction,
      attachment,
      filemime,
      filename,
      filesize,
      isMe,
      contact: (contact ? { ...contact } : {}) as any,
      setupCodeBegin,
      hasHTML: msg.hasHTML,
      overrideSenderName: msg.overrideSenderName,
    }
  }

  forwardMessage(msgId: number, chatId: number) {
    this._dc.forwardMessages([msgId], chatId)
    this._controller.chatList.selectChat(chatId)
  }

  getMessageIds(chatId: number, markerOne?: MarkerOneParams) {
    log.debug(
      `getMessageIds: chatId: ${chatId} markerOne: ${JSON.stringify(markerOne)}`
    )
    const messageIds = []

    for (const messageId of this._dc.getChatMessages(
      chatId,
      C.DC_GCM_ADDDAYMARKER,
      0
    )) {
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
    markerOne?: MarkerOneParams
  ): Promise<MessageType[]> {
    log.debug(
      `getMessages: chatId: ${chatId} markerOne: ${JSON.stringify(markerOne)}`
    )
    const messageIds = this.getMessageIds(chatId, markerOne)

    const messages: MessageType[] = []
    for (
      let messageIndex = indexStart;
      messageIndex <= indexEnd;
      messageIndex++
    ) {
      const messageId = messageIds[messageIndex]

      let messageObject: MessageType = null
      if (messageId == C.DC_MSG_ID_DAYMARKER) {
        const nextMessageIndex = messageIndex + 1
        const nextMessageId = messageIds[nextMessageIndex]
        const nextMessageTimestamp = this._dc
          .getMessage(nextMessageId)
          .getTimestamp()
        messageObject = {
          type: MessageTypeIs.DayMarker,
          timestamp: nextMessageTimestamp,
        }
      } else if (messageId === C.DC_MSG_ID_MARKER1) {
        messageObject = {
          type: MessageTypeIs.MarkerOne,
          count: markerOne[messageIds[messageIndex + 1]],
        }
      } else if (messageId <= C.DC_MSG_ID_LAST_SPECIAL) {
        log.debug(
          `getMessages: not sure what do with this messageId: ${messageId}, skipping`
        )
      } else {
        const msg = this._dc.getMessage(messageId)
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
    this._dc.markSeenMessages(messageIds)
  }

  searchMessages(query: string, chatId = 0): number[] {
    return this._dc.searchMessages(chatId, query)
  }

  private _msgId2SearchResultItem(msgId: number): MessageSearchResult {
    const message = this._dc.getMessage(msgId)
    const chat = this._dc.getChat(message.getChatId())
    const author = this._dc.getContact(message.getFromId())

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
    const message_html_content = this._dc.getMessageHTML(messageId)
    const pathToFile = tempy.file({ extension: 'html' })
    await writeFile(pathToFile, message_html_content, { encoding: 'utf-8' })
    return pathToFile
  }
}

function convertContentType({
  filemime,
  viewType,
  file,
}: {
  filemime: string
  viewType: number
  file: string
}) {
  if (!filemime) return 'application/octet-stream'
  if (filemime !== 'application/octet-stream') return filemime

  switch (viewType) {
    case C.DC_MSG_IMAGE:
      return 'image/jpg'
    case C.DC_MSG_VOICE:
      return 'audio/ogg'
    case C.DC_MSG_FILE:
      return mime.lookup(file) || 'application/octet-stream'
    default:
      return 'application/octet-stream'
  }
}
