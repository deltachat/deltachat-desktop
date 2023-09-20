import React, { ChangeEvent, Component } from 'react'
import { ScreenContext } from '../contexts'
import {
  AudioAttachment,
  FileAttachmentRow,
  GalleryAttachmentElementProps,
  ImageAttachment,
  VideoAttachment,
  WebxdcAttachment,
} from './attachment/mediaAttachment'
import { getLogger } from '../../shared/logger'
import { BackendRemote, Type } from '../backend-com'
import { selectedAccountId } from '../ScreenController'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeGrid } from 'react-window'

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
    element: FileAttachmentRow,
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
    loading: boolean
    queryText: string
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
      loading: true,
      queryText: '',
    }
  }

  reset() {
    this.setState({
      id: 'images',
      msgTypes: MediaTabs.images.values,
      element: ImageAttachment,
      mediaMessageIds: [],
      mediaLoadResult: {},
      loading: true,
      queryText: '',
    })
  }

  componentDidMount() {
    this.onSelect(this.state.id)
  }

  componentDidUpdate(prevProps: mediaProps) {
    if (this.props.chatId !== prevProps.chatId) {
      // reset
      this.reset()
      this.onSelect('images')
    }
  }

  onSelect(id: MediaTabKey) {
    if (!this.props.chatId) {
      throw new Error('chat id missing')
    }
    const msgTypes = MediaTabs[id].values
    const newElement = MediaTabs[id].element
    const accountId = selectedAccountId()
    const chatId = this.props.chatId !== 'all' ? this.props.chatId : null
    this.setState({ loading: true })

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
          element: newElement,
          mediaMessageIds: media_ids,
          mediaLoadResult,
          loading: false,
        })
        this.forceUpdate()
      })
      .catch(log.error.bind(log))
  }

  onChangeInput(ev: ChangeEvent<HTMLInputElement>) {
    this.setState({ queryText: ev.target.value })
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
    const {
      mediaMessageIds,
      mediaLoadResult,
      id,
      loading,
      queryText,
    } = this.state
    const tx = window.static_translate // static because dynamic isn't too important here
    const emptyTabMessage = this.emptyTabMessage(id)

    const filteredMediaMessageIds = mediaMessageIds.filter(id => {
      const result = mediaLoadResult[id]
      if (
        result.variant === 'message' &&
        result.fileName?.indexOf(queryText) !== -1
      ) {
        return true
      } else {
        return false
      }
    })

    return (
      <div className='media-view'>
        <div style={{ minWidth: 200 }}>
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
          <div role='tabpanel'>
            {this.state.id === 'files' && (
              <input
                type='search'
                placeholder='search files'
                onChange={this.onChangeInput.bind(this)}
              />
            )}
            <div
              className='gallery'
              key={this.state.msgTypes.join('.') + String(this.props.chatId)}
              style={{
                overflow: this.state.id === 'files' ? 'scroll' : undefined,
              }}
            >
              {mediaMessageIds.length < 1 && !loading && (
                <div className='empty-screen'>
                  {/* IDEA: when we have someone doing illustrations this would be a great place to add some */}
                  <p className='no-media-message'>{emptyTabMessage}</p>
                </div>
              )}

              {this.state.id === 'files' && (
                <div className='item-container'>
                  {filteredMediaMessageIds.map(msgId => {
                    const message = mediaLoadResult[msgId]
                    return (
                      <div className='item' key={msgId}>
                        <FileAttachmentRow
                          msgId={msgId}
                          load_result={message}
                          queryText={queryText}
                        />
                      </div>
                    )
                  })}
                </div>
              )}

              {this.state.id !== 'files' && (
                <AutoSizer>
                  {({ width, height }) => {
                    const widthWithoutScrollbar = width - 6

                    let minWidth = 160

                    if (this.state.id === 'webxdc_apps') {
                      minWidth = 265
                    } else if (this.state.id === 'audio') {
                      minWidth = 322
                    }

                    const itemsPerRow = Math.max(
                      Math.floor(widthWithoutScrollbar / minWidth),
                      1
                    )

                    const itemWidth = widthWithoutScrollbar / itemsPerRow

                    const rowCount = Math.ceil(
                      mediaMessageIds.length / itemsPerRow
                    )

                    let itemHeight = itemWidth

                    if (this.state.id === 'webxdc_apps') {
                      itemHeight = 61
                    } else if (this.state.id === 'audio') {
                      itemHeight = 88
                    }

                    const border =
                      this.state.id === 'audio' ? '1px solid black' : undefined

                    return (
                      <FixedSizeGrid
                        width={width}
                        height={height}
                        columnWidth={itemWidth}
                        rowHeight={itemHeight}
                        columnCount={itemsPerRow}
                        rowCount={rowCount}
                        overscanRowCount={10}
                      >
                        {({ columnIndex, rowIndex, style }) => {
                          const msgId =
                            mediaMessageIds[
                              rowIndex * itemsPerRow + columnIndex
                            ]
                          const message = mediaLoadResult[msgId]
                          if (!message) {
                            return null
                          }
                          return (
                            <div
                              style={{ ...style, border }}
                              className='item'
                              key={msgId}
                            >
                              <this.state.element
                                msgId={msgId}
                                load_result={message}
                              />
                            </div>
                          )
                        }}
                      </FixedSizeGrid>
                    )
                  }}
                </AutoSizer>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Gallery.contextType = ScreenContext
