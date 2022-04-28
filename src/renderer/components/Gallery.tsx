import React, { Component } from 'react'
import { C } from 'deltachat-node/dist/constants'

import { DeltaBackend } from '../delta-remote'
import { ScreenContext } from '../contexts'
import MediaAttachment from './attachment/mediaAttachment'
import { MessageType } from '../../shared/shared-types'
import { getLogger } from '../../shared/logger'

const log = getLogger('renderer/Gallery')

type MediaTabKey = 'images' | 'video' | 'audio' | 'documents' | 'webxdc'

const MediaTabs: Readonly<
  {
    [key in MediaTabKey]: { values: number[] }
  }
> = Object.freeze({
  images: {
    values: [C.DC_MSG_GIF, C.DC_MSG_IMAGE],
  },
  video: {
    values: [C.DC_MSG_VIDEO],
  },
  audio: {
    values: [C.DC_MSG_AUDIO, C.DC_MSG_VOICE],
  },
  documents: {
    values: [C.DC_MSG_FILE],
  },
  webxdc: {
    values: [C.DC_MSG_WEBXDC],
  },
})

type mediaProps = { chatId: number }

export default class Gallery extends Component<
  mediaProps,
  { id: MediaTabKey; msgTypes: number[]; medias: MessageType[] }
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

  onSelect(id: MediaTabKey) {
    if (!this.props.chatId) {
      throw new Error('chat id missing')
    }
    const msgTypes = MediaTabs[id].values
    DeltaBackend.call(
      'chat.getChatMedia',
      this.props.chatId,
      msgTypes[0],
      msgTypes[1],
      0
    ).then(raw_medias => {
      const medias = raw_medias.filter(m => !!m) as MessageType[]
      if (medias.length !== raw_medias.length) {
        log.error(
          'some empty gallery items detected, maybe messages are missing?'
        )
      }
      this.setState({ id, msgTypes, medias })
      this.forceUpdate()
    })
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
                  {tx(id)}
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

Gallery.contextType = ScreenContext
