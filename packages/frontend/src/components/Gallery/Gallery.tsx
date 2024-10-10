import React, { ChangeEvent, PureComponent, createRef, RefObject } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeGrid } from 'react-window'
import moment from 'moment'

import {
  AudioAttachment,
  ImageAttachment,
  VideoAttachment,
  WebxdcAttachment,
} from '../attachment/mediaAttachment'
import { getLogger } from '@deltachat-desktop/shared/logger'
import { BackendRemote, Type } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import SettingsStoreInstance, {
  SettingsStoreState,
} from '../../stores/settings'
import FullscreenMedia, {
  NeighboringMediaMode,
} from '../dialogs/FullscreenMedia'
import { DialogContext } from '../../contexts/DialogContext'
import TabList from '../TabList'
import { FileSearch, FileTable, FilesNoResult } from './Files'
import { ChatId, MessageId, GalleryElement, MediaTabKey } from './types'

const log = getLogger('renderer/Gallery')

const tabNames: MediaTabKey[] = [
  'images',
  'video',
  'audio',
  'files',
  'apps',
]

const tabMsgTypes: Record<MediaTabKey, [Type.Viewtype, Type.Viewtype | null]> =
  {
    images: ['Gif', 'Image'],
    video: ['Video', null],
    audio: ['Audio', null],
    files: ['File', null],
    apps: ['Webxdc', null],
  }

interface State {
  currentTab: MediaTabKey
  mediaMessageIds: MessageId[]
  queryText: string
  loading: boolean
  mediaLoadResult: Record<MessageId, Type.MessageLoadResult>
  galleryImageKeepAspectRatio?: boolean
}

interface Props {
  chatId: ChatId | 'all'
  onUpdateView?: () => void
}

export default class Gallery extends PureComponent<Props, State> {
  dateHeader: RefObject<HTMLDivElement>
  constructor(props: Props) {
    super(props)

    this.state = {
      currentTab: 'images',
      mediaMessageIds: [],
      mediaLoadResult: {},
      loading: true,
      queryText: '',
      galleryImageKeepAspectRatio: false,
    }
    this.dateHeader = createRef()
    this.settingsStoreListener = this.settingsStoreListener.bind(this)
  }

  reset() {
    this.setState({
      currentTab: 'images',
      mediaMessageIds: [],
      mediaLoadResult: {},
      loading: true,
      queryText: '',
    })
  }

  componentDidMount() {
    this.onSelect(this.state.currentTab)
    SettingsStoreInstance.subscribe(this.settingsStoreListener)
    this.setState({
      galleryImageKeepAspectRatio:
        SettingsStoreInstance.state?.desktopSettings
          .galleryImageKeepAspectRatio,
    })
  }

  componentWillUnmount() {
    SettingsStoreInstance.unsubscribe(this.settingsStoreListener)
  }

  settingsStoreListener(state: SettingsStoreState | null) {
    if (state) {
      this.setState({
        galleryImageKeepAspectRatio:
          state.desktopSettings.galleryImageKeepAspectRatio,
      })
    }
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.chatId !== prevProps.chatId) {
      // reset
      this.reset()
      this.onSelect('images')
    }
  }

  onSelect(tab: MediaTabKey) {
    this.setState({ loading: true })
    const { chatId, onUpdateView } = this.props
    if (!chatId) {
      throw new Error('chat id missing')
    }
    const accountId = selectedAccountId()
    const chatId2 = chatId !== 'all' ? chatId : null

    const types = tabMsgTypes[tab]

    BackendRemote.rpc
      .getChatMedia(accountId, chatId2, types[0], types[1], null)
      .then(async (mediaIds: MessageId[]) => {
        const mediaLoadResult = await BackendRemote.rpc.getMessages(
          accountId,
          mediaIds
        )
        mediaIds.reverse() // order newest up - if we need different ordering we need to do it in core
        this.setState({
          currentTab: tab,
          mediaMessageIds: mediaIds,
          mediaLoadResult,
          loading: false,
        })
        this.forceUpdate() // why?
        onUpdateView?.()
      })
      .catch(log.error.bind(log))
  }

  onChangeInput(ev: ChangeEvent<HTMLInputElement>) {
    this.setState({ queryText: ev.target.value })
  }

  updateFirstVisibleMessage(message: Type.MessageLoadResult) {
    if (message.kind === 'message') {
      if (
        typeof this.dateHeader.current === 'object' &&
        this.dateHeader.current
      ) {
        this.dateHeader.current.innerText = moment(
          message.timestamp * 1000
        ).format('LL')
      }
    }
  }

  openFullscreenMedia(message: Type.Message) {
    this.context.openDialog(FullscreenMedia, {
      msg: message,
      neighboringMedia:
        this.props.chatId === 'all'
          ? NeighboringMediaMode.Global
          : NeighboringMediaMode.Chat,
    })
  }

  render() {
    const { mediaMessageIds, mediaLoadResult, currentTab, loading, queryText } =
      this.state
    console.log('MEOW', this)
    const chatId = this.props.chatId
    const filteredMediaMessageIds = mediaMessageIds.filter(id => {
      const result = mediaLoadResult[id]
      return (
        result.kind === 'message' &&
        result.fileName?.toLowerCase().indexOf(queryText.toLowerCase()) !== -1
      )
    })

    const showDateHeader = currentTab !== 'files' && currentTab !== 'apps'

    const extraChild = (
      <>
        {showDateHeader && <div className='big-date' ref={this.dateHeader} />}
        {currentTab === 'files' && (
          <FileSearch onChange={this.onChangeInput.bind(this)} />
        )}
      </>
    )
    return (
      <div className='media-view'>
        <TabList
          tabNames={tabNames}
          tabChangeCb={(newTab: string) =>
            this.setState({ currentTab: newTab as MediaTabKey })
          }
          extra={extraChild}
        >
          {
            // Order here is important, it should be according to this.tabNames --Farooq
          }
          <TabBody
            attachmentElement={ImageAttachment}
            minWidth={160}
            itemHeight={160}
            mediaMessageIds={mediaMessageIds}
            mediaLoadResult={mediaLoadResult}
            openFullscreenMedia={this.openFullscreenMedia.bind(this)}
            updateFirstVisibleMessage={this.updateFirstVisibleMessage.bind(
              this
            )}
            loading={loading}
            key={'image' + chatId}
          />
          <TabBody
            attachmentElement={VideoAttachment}
            minWidth={160}
            itemHeight={160}
            mediaMessageIds={mediaMessageIds}
            mediaLoadResult={mediaLoadResult}
            openFullscreenMedia={this.openFullscreenMedia.bind(this)}
            updateFirstVisibleMessage={this.updateFirstVisibleMessage.bind(
              this
            )}
            loading={loading}
            key={'video' + chatId}
          />
          <TabBody
            attachmentElement={AudioAttachment}
            minWidth={322}
            itemHeight={94}
            mediaMessageIds={mediaMessageIds}
            mediaLoadResult={mediaLoadResult}
            openFullscreenMedia={this.openFullscreenMedia.bind(this)}
            updateFirstVisibleMessage={this.updateFirstVisibleMessage.bind(
              this
            )}
            loading={loading}
            key={'audio' + chatId}
          />
          <div key={'file' + chatId}>
            {loading && <Loading />}
            {!loading && (
              <>
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
                {filteredMediaMessageIds.length === 0 && (
                  <FilesNoResult queryText={queryText} />
                )}
              </>
            )}
          </div>
          <TabBody
            attachmentElement={WebxdcAttachment}
            minWidth={265}
            itemHeight={61}
            mediaMessageIds={mediaMessageIds}
            mediaLoadResult={mediaLoadResult}
            openFullscreenMedia={this.openFullscreenMedia.bind(this)}
            updateFirstVisibleMessage={this.updateFirstVisibleMessage.bind(
              this
            )}
            loading={loading}
            key={'xdc' + chatId}
          />
        </TabList>
      </div>
    )
  }
}

Gallery.contextType = DialogContext

interface TabBodyProps {
  minWidth: number
  mediaMessageIds: MessageId[]
  itemHeight: number
  mediaLoadResult: Record<MessageId, Type.MessageLoadResult>
  attachmentElement: GalleryElement
  openFullscreenMedia: (message: Type.Message) => void
  updateFirstVisibleMessage: (result: Type.MessageLoadResult) => void
  loading: boolean
}

function TabBody({
  minWidth,
  mediaMessageIds,
  mediaLoadResult,
  attachmentElement,
  openFullscreenMedia,
  itemHeight,
  updateFirstVisibleMessage,
  loading,
}: TabBodyProps) {
  const AttachmentElement = attachmentElement
  if (loading) {
    return (
      <AutoSizer>
        {() => {
          return <Loading />
        }}
      </AutoSizer>
    )
  }
  return (
    <AutoSizer>
      {({ width, height }) => {
        const widthWithoutScrollbar = width - 6

        const itemsPerRow = Math.max(
          Math.floor(widthWithoutScrollbar / minWidth),
          1
        )

        const itemWidth = widthWithoutScrollbar / itemsPerRow

        const rowCount = Math.ceil(mediaMessageIds.length / itemsPerRow)

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
                  visibleRowStartIndex * itemsPerRow + visibleColumnStartIndex
                ]
              const message = mediaLoadResult[msgId]
              if (!message) {
                return
              }
              updateFirstVisibleMessage(message)
            }}
          >
            {({ columnIndex, rowIndex, style }) => {
              const msgId =
                mediaMessageIds[rowIndex * itemsPerRow + columnIndex]
              const message = mediaLoadResult[msgId]
              if (!message) {
                return null
              }
              return (
                <div style={{ ...style }} className='item' key={msgId}>
                  <AttachmentElement
                    messageId={msgId}
                    loadResult={message}
                    openFullscreenMedia={openFullscreenMedia}
                  />
                </div>
              )
            }}
          </FixedSizeGrid>
        )
      }}
    </AutoSizer>
  )
}

function Loading() {
  return <p style={{ textAlign: 'center' }}>Please wait...</p>
}
