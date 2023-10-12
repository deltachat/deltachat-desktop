import React, { ChangeEvent, Component, createRef } from 'react'
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
import { FixedSizeGrid, FixedSizeList } from 'react-window'
import SettingsStoreInstance, { SettingsStoreState } from '../stores/settings'
import moment from 'moment'
import FullscreenMedia, {
  NeighboringMediaMode,
} from './dialogs/FullscreenMedia'

const log = getLogger('renderer/Gallery')

type MediaTabKey = 'images' | 'video' | 'audio' | 'files' | 'webxdc_apps'

type GalleryElement = (
  props: GalleryAttachmentElementProps & {
    openFullscreenMedia: (message: Type.Message) => void
  }
) => JSX.Element

const MediaTabs: Readonly<
  {
    [key in MediaTabKey]: {
      values: Type.Viewtype[]
      element: GalleryElement
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
    element: GalleryElement
    mediaMessageIds: number[]
    mediaLoadResult: Record<number, Type.MessageLoadResult>
    loading: boolean
    queryText: string
    GalleryImageKeepAspectRatio?: boolean
  }
> {
  dateHeader = createRef<HTMLDivElement>()
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
      GalleryImageKeepAspectRatio: false,
    }

    this.settingsStoreListener = this.settingsStoreListener.bind(this)
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
    SettingsStoreInstance.subscribe(this.settingsStoreListener)
    this.setState({
      GalleryImageKeepAspectRatio:
        SettingsStoreInstance.state?.desktopSettings
          .GalleryImageKeepAspectRatio,
    })
  }

  componentWillUnmount() {
    SettingsStoreInstance.unsubscribe(this.settingsStoreListener)
  }

  settingsStoreListener(state: SettingsStoreState | null) {
    if (state) {
      this.setState({
        GalleryImageKeepAspectRatio:
          state.desktopSettings.GalleryImageKeepAspectRatio,
      })
    }
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

  updateFirstVisibleMessage(message: Type.MessageLoadResult) {
    if (message.variant === 'message') {
      if (this.dateHeader.current)
        this.dateHeader.current.innerText = moment(
          message.timestamp * 1000
        ).format('LL')
    }
  }

  openFullscreenMedia(message: Type.Message) {
    window.__openDialog(FullscreenMedia, {
      msg: message,
      neighboringMedia:
        this.props.chatId === 'all'
          ? NeighboringMediaMode.Global
          : NeighboringMediaMode.Chat,
    })
  }

  render() {
    const {
      mediaMessageIds,
      mediaLoadResult,
      id,
      loading,
      queryText,
      GalleryImageKeepAspectRatio,
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

    const showDateHeader =
      this.state.id !== 'files' && this.state.id !== 'webxdc_apps'

    return (
      <div className='media-view'>
        <div style={{ minWidth: 200 }}>
          <ul
            className='bp4-tab-list .modifier'
            role='tablist'
            style={{ display: 'flex', alignItems: 'center' }}
          >
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
            {showDateHeader && (
              <div className='big-date' ref={this.dateHeader}></div>
            )}
            {this.state.id === 'files' && (
              <>
                <div style={{ flexGrow: 1 }}></div>
                <input
                  type='search'
                  placeholder='search files'
                  onChange={this.onChangeInput.bind(this)}
                />
              </>
            )}
          </ul>
          <div role='tabpanel'>
            <div
              className={`gallery gallery-image-object-fit_${
                GalleryImageKeepAspectRatio ? 'contain' : 'cover'
              }`}
              key={this.state.msgTypes.join('.') + String(this.props.chatId)}
            >
              {mediaMessageIds.length < 1 && !loading && (
                <div className='empty-screen'>
                  {/* IDEA: when we have someone doing illustrations this would be a great place to add some */}
                  <p className='no-media-message'>{emptyTabMessage}</p>
                </div>
              )}

              {this.state.id === 'files' && (
                <AutoSizer>
                  {({ width, height }) => (
                    <FileTable
                      width={width}
                      height={height}
                      mediaLoadResult={mediaLoadResult}
                      mediaMessageIds={filteredMediaMessageIds}
                      queryText={queryText}
                    ></FileTable>
                  )}
                </AutoSizer>
              )}
              {/* TODO empty state for no search result on files, maybe including query text */}

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
                        onItemsRendered={({
                          visibleColumnStartIndex,
                          visibleRowStartIndex,
                        }) => {
                          const msgId =
                            mediaMessageIds[
                              visibleRowStartIndex * itemsPerRow +
                                visibleColumnStartIndex
                            ]
                          const message = mediaLoadResult[msgId]
                          if (!message) {
                            return
                          }
                          this.updateFirstVisibleMessage(message)
                        }}
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
                                openFullscreenMedia={this.openFullscreenMedia.bind(
                                  this
                                )}
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

function FileTable({
  width,
  height,
  mediaMessageIds,
  mediaLoadResult,
  queryText,
}: {
  width: number
  height: number
  mediaMessageIds: number[]
  mediaLoadResult: Record<number, Type.MessageLoadResult>
  queryText: string
}) {
  return (
    <FixedSizeList
      width={width}
      height={height}
      itemSize={60}
      itemCount={mediaMessageIds.length}
      overscanCount={10}
      itemData={mediaMessageIds}
    >
      {({ index, style, data }) => {
        const msgId = data[index]
        const message = mediaLoadResult[msgId]
        if (!message) {
          return null
        }
        return (
          <div style={style} className='item' key={msgId}>
            <FileAttachmentRow
              msgId={msgId}
              load_result={message}
              queryText={queryText}
            />
          </div>
        )
      }}
    </FixedSizeList>
  )
}
