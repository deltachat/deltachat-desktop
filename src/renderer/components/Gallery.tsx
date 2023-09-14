import React, { Component } from 'react'
import { ScreenContext } from '../contexts'
import {
  AudioAttachment,
  FileAttachment,
  GalleryAttachmentElementProps,
  ImageAttachment,
  VideoAttachment,
  WebxdcAttachment,
} from './attachment/mediaAttachment'
import { getLogger } from '../../shared/logger'
import { BackendRemote, Type } from '../backend-com'
import { selectedAccountId } from '../ScreenController'

const log = getLogger('renderer/Gallery')

type MediaTabKey = 'images' | 'video' | 'audio' | 'files' | 'webxdc_apps'

const MediaTabs: Readonly<
  {
    [key in MediaTabKey]: {
      values: Type.Viewtype[]
      element: (props: GalleryAttachmentElementProps) => JSX.Element
    }
  }
> = {
  images: {
    values: ['Gif', 'Image'],
    element: ImageAttachment,
  },
  video: {
    values: ['Video'],
    element: VideoAttachment,
  },
  audio: {
    values: ['Audio', 'Voice'],
    element: AudioAttachment,
  },
  files: {
    values: ['File'],
    element: FileAttachment,
  },
  webxdc_apps: {
    values: ['Webxdc'],
    element: WebxdcAttachment,
  },
}

type mediaProps = { chatId: number | 'all' }

export default class Gallery extends Component<
  mediaProps,
  {
    id: MediaTabKey
    msgTypes: Type.Viewtype[]
    element: (props: GalleryAttachmentElementProps) => JSX.Element
    mediaMessageIds: number[]
    mediaLoadResult: Record<number, Type.MessageLoadResult>
  }
> {
  constructor(props: mediaProps) {
    super(props)
    this.state = {
      id: 'images',
      msgTypes: MediaTabs.images.values,
      element: ImageAttachment,
      mediaMessageIds: [],
      mediaLoadResult: {},
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

  onSelect(id: MediaTabKey) {
    if (!this.props.chatId) {
      throw new Error('chat id missing')
    }
    const msgTypes = MediaTabs[id].values
    const accountId = selectedAccountId()
    const chatId = this.props.chatId !== 'all' ? this.props.chatId : null

    BackendRemote.rpc
      .getChatMedia(accountId, chatId, msgTypes[0], msgTypes[1], null)
      .then(async media_ids => {
        const mediaLoadResult = await BackendRemote.rpc.getMessages(
          accountId,
          media_ids
        )
        media_ids.reverse() // order newest up - if we need different ordering we need to do it in core
        this.setState({
          id,
          msgTypes,
          mediaMessageIds: media_ids,
          mediaLoadResult,
        })
        this.forceUpdate()
      })
      .catch(log.error.bind(log))
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
      case 'webxdc_apps':
        return tx('tab_webxdc_empty_hint')
      case 'files':
      default:
        return tx('tab_docs_empty_hint')
    }
  }

  render() {
    const { mediaMessageIds, mediaLoadResult, id } = this.state
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
                  {tx(id)}
                </li>
              )
            })}
          </ul>
          <div className='bp4-tab-panel' role='tabpanel'>
            <div className='gallery'>
              <div className='item-container'>
                {mediaMessageIds.length < 1 ? (
                  <p className='no-media-message'>{emptyTabMessage}</p>
                ) : (
                  ''
                )}
                {mediaMessageIds.map(msgId => {
                  const message = mediaLoadResult[msgId]
                  return (
                    <div className='item' key={msgId}>
                      <this.state.element msgId={msgId} load_result={message} />
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

Gallery.contextType = ScreenContext
