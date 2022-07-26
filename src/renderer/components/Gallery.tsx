import React, { Component } from 'react'
import { C } from 'deltachat-node/node/dist/constants'

import { DeltaBackend } from '../delta-remote'
import { ScreenContext } from '../contexts'
import MediaAttachment from './attachment/mediaAttachment'
import { MessageType } from '../../shared/shared-types'
import { getLogger } from '../../shared/logger'
import { BackendRemote } from '../backend-com'
import { selectedAccountId } from '../ScreenController'
import { Viewtype, Message, WebxdcMessageInfo } from 'deltachat-node/deltachat-jsonrpc/typescript/generated/types'
import { WebxdcInfo } from 'deltachat-node/node/dist/context'

const log = getLogger('renderer/Gallery')

type MediaTabKey = 'images' | 'video' | 'audio' | 'documents' | 'webxdc'

const MediaTabs: Readonly<
  {
    [key in MediaTabKey]: { values: Type.Viewtype[] }
  }
> = Object.freeze({
  images: {
    values: ["Gif", "Image"],
  },
  video: {
    values: ["Video"],
  },
  audio: {
    values: ["Audio", "Voice"],
  },
  documents: {
    values: ["File"],
  },
  webxdc: {
    values: ["Webxdc"],
  },
})

type mediaProps = { chatId: number }

export default class Gallery extends Component<
  mediaProps,
  { id: MediaTabKey; msgTypes: Viewtype[]; medias: MessageType[] }
> {
  constructor(props: mediaProps) {
    super(props)
    this.state = {
      id: 'images',
      msgTypes: MediaTabs.images.values,
      medias: [],
    }
  }

  componentDidMount() {
    this.onSelect(this.state.id)
  }

  componentDidUpdate(prevProps: mediaProps) {
    if (this.props.chatId !== prevProps.chatId) {
      this.onSelect(this.state.id)
    }
  }

  async onSelect(id: MediaTabKey) {
    if (!this.props.chatId) {
      throw new Error('chat id missing')
    }

    const msgTypes = MediaTabs[id].values
    const mediaMessageIds = await BackendRemote.rpc.chatGetMedia(
      selectedAccountId(),
      this.props.chatId,
      msgTypes[0],
      msgTypes[1] || null,
      msgTypes[2] || null
    )
    const mediaMessages = await BackendRemote.rpc.messageGetMessages(selectedAccountId(), mediaMessageIds)
    this.setState({ id, msgTypes, mediaMessages })
    this.forceUpdate()
  }

  emptyTabMessage(id: MediaTabKey): string {
    const tx = window.static_translate // static because dynamic isn't too important here
    switch (id) {
      case 'images':
        return tx('tab_image_empty_hint')
      case 'video':
        return tx('tab_video_empty_hint')
      case 'audio':
        return tx('tab_audio_empty_hint')
      case 'webxdc':
        return tx('tab_webxdc_empty_hint')
      case 'documents':
      default:
        return tx('tab_docs_empty_hint')
    }
  }

  render() {
    const { medias, id } = this.state
    const tx = window.static_translate // static because dynamic isn't too important here
    const emptyTabMessage = this.emptyTabMessage(id)

    return (
      <div className='media-view'>
        <div className='bp4-tabs' style={{ minWidth: 200 }}>
          <ul className='bp4-tab-list .modifier' role='tablist'>
            {Object.keys(MediaTabs).map(realId => {
              const id = realId as MediaTabKey
              return (
                <li
                  key={id}
                  className='bp4-tab'
                  role='tab'
                  aria-selected={this.state.id === id}
                  onClick={() => this.onSelect(id)}
                >
                  {id === 'webxdc' ? 'Webxdc' : tx(id)}
                </li>
              )
            })}
          </ul>
          <div className='bp4-tab-panel' role='tabpanel'>
            <div className='gallery'>
              <div className='item-container'>
                {medias.length < 1 ? (
                  <p className='no-media-message'>{emptyTabMessage}</p>
                ) : (
                  ''
                )}
                {medias
                  .sort((a, b) => b.sortTimestamp - a.sortTimestamp)
                  .map(message => {
                    return (
                      <div className='item' key={message.id}>
                        <MediaAttachment message={message} />
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export function newViewtypeToOldViewtype(viewtype: Viewtype) {
  switch (viewtype) {
    case "Unknown":
      return 0
    case "Text":
      return C.DC_MSG_TEXT
    case "Image":
      return C.DC_MSG_IMAGE
    case "Gif":
      return C.DC_MSG_GIF
    case "Sticker":
      return C.DC_MSG_STICKER
    case "Audio":
      return C.DC_MSG_AUDIO
    case "Voice":
      return C.DC_MSG_VOICE
    case "Video":
      return C.DC_MSG_VIDEO
    case "File":
      return C.DC_MSG_FILE
    case "VideochatInvitation":
      return C.DC_MSG_VIDEOCHAT_INVITATION
    case "Webxdc":
      return C.DC_MSG_WEBXDC
  }
}

export function newWebxdcInfoToOldWebxdcInfo(newWebxdcInfo: WebxdcMessageInfo): WebxdcInfo {
  return {
    name: newWebxdcInfo.name,
    icon: newWebxdcInfo.icon,
    summary: newWebxdcInfo.summary || ""
  }
}

export async function newMessageToOldMessage(message: Message): MessageType {
  const accountId = selectedAccountId()
  const oldViewType = newViewtypeToOldViewtype(message.viewType)
  const webxdcInfo = message.viewType === 'Webxdc' ? newWebxdcInfoToOldWebxdcInfo(await BackendRemote.rpc.messageGetWebxdcInfo(accountId, message.id)) : null
  const downloadState = message.downloadState
  return {
    chatId: message.chatId,
    webxdcInfo,
    downloadState,
    duration: this.getDuration(),
    file: this.getFile(),
    fromId: this.getFromId(),
    id: this.getId(),
    quotedText: this.getQuotedText(),
    quotedMessageId: quotedMessage ? quotedMessage.getId() : null,
    receivedTimestamp: this.getReceivedTimestamp(),
    sortTimestamp: this.getSortTimestamp(),
    text: this.getText(),
    timestamp: this.getTimestamp(),
    hasLocation: this.hasLocation(),
    hasHTML: this.hasHTML,
    viewType,
    state: binding.dcn_msg_get_state(this.dc_msg),
    hasDeviatingTimestamp: this.hasDeviatingTimestamp(),
    showPadlock: this.getShowpadlock(),
    summary: this.getSummary().toJson(),
    subject: this.subject,
    isSetupmessage: this.isSetupmessage(),
    isInfo: this.isInfo(),
    isForwarded: this.isForwarded(),
    dimensions: {
      height: this.getHeight(),
      width: this.getWidth(),
    },
    videochatType: this.getVideochatType(),
    videochatUrl: this.getVideochatUrl(),
    overrideSenderName: this.overrideSenderName,
    parentId: this.parent?.getId(),

  }
}

Gallery.contextType = ScreenContext
