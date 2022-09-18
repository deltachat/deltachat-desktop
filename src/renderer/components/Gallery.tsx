import React, { Component } from 'react'
import { ScreenContext } from '../contexts'
import MediaAttachment from './attachment/mediaAttachment'
import { getLogger } from '../../shared/logger'
import { BackendRemote, Type } from '../backend-com'
import { selectedAccountId } from '../ScreenController'

const log = getLogger('renderer/Gallery')

type MediaTabKey = 'images' | 'video' | 'audio' | 'files' | 'webxdc'

const MediaTabs: Readonly<
  {
    [key in MediaTabKey]: { values: Type.Viewtype[] }
  }
> = {
  images: {
    values: ['Gif', 'Image'],
  },
  video: {
    values: ['Video'],
  },
  audio: {
    values: ['Audio', 'Voice'],
  },
  files: {
    values: ['File'],
  },
  webxdc: {
    values: ['Webxdc'],
  },
}

type mediaProps = { chatId: number }

export default class Gallery extends Component<
  mediaProps,
  { id: MediaTabKey; msgTypes: Type.Viewtype[]; medias: Type.Message[] }
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

    const accountId = selectedAccountId()
    BackendRemote.rpc
      .chatGetMedia(
        accountId,
        this.props.chatId,
        msgTypes[0],
        msgTypes[1],
        null
      )
      .then(async media_ids => {
        // throws if some media is not found
        const medias = await Promise.all(
          media_ids.map(id =>
            BackendRemote.rpc.messageGetMessage(accountId, id)
          )
        )
        this.setState({ id, msgTypes, medias })
        this.forceUpdate()
      })
      .catch(log.error)
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
      case 'files':
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

Gallery.contextType = ScreenContext
