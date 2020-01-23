import React, { Component } from 'react'
import { C } from 'deltachat-node/constants.enum'
import { onDownload } from './message/messageFunctions'
import { callDcMethodAsync } from '../ipc'

import { ScreenContext } from '../contexts'
import Attachment, { isDisplayableByFullscreenMedia } from './message/Attachment'

type MediaTabKey = 'images' | 'video' | 'audio' | 'documents'

const MediaTabs: Readonly<{
  [key in MediaTabKey]: { values: number[] }
}> = Object.freeze({
  images: {
    values: [C.DC_MSG_GIF, C.DC_MSG_IMAGE]
  },
  video: {
    values: [C.DC_MSG_VIDEO]
  },
  audio: {
    values: [C.DC_MSG_AUDIO, C.DC_MSG_VOICE]
  },
  documents: {
    values: [C.DC_MSG_FILE]
  }
})

type mediaProps = { chat: any }

type message = any //Todo import that from somewhere

export default class Media extends Component<
mediaProps, { id: MediaTabKey, msgTypes: number[], medias: any }> {
  constructor(props: mediaProps) {
    super(props)
    this.state = {
      id: 'images',
      msgTypes: MediaTabs.images.values,
      medias: []
    }
  }

  componentDidMount() {
    this.onSelect(this.state.id)
  }

  componentDidUpdate(prevProps: mediaProps) {
    if (!prevProps.chat || (this.props.chat.id !== prevProps.chat.id)) {
      this.onSelect(this.state.id)
    }
  }

  onSelect(id: MediaTabKey) {
    const msgTypes = MediaTabs[id].values
    callDcMethodAsync('chat.getChatMedia', [msgTypes[0], msgTypes[1]])
      .then(medias => {
        this.setState({ id, msgTypes, medias })
        this.forceUpdate()
      })
  }

  onClickMedia(message:message, ev: MouseEvent) {
    ev.preventDefault()
    ev.stopPropagation()
    ev.stopImmediatePropagation()
    const attachment = message.msg.attachment
    if (isDisplayableByFullscreenMedia(attachment)) {
      this.context.openDialog('FullscreenMedia', { message })
    } else {
      onDownload(message.msg)
    }
  }

  render() {
    const { medias } = this.state
    const tx = (window as any).translate
    return <div className='media-view' >
      <div className='bp3-tabs' style={{ minWidth: 200 }
      }>
        <ul className='bp3-tab-list .modifier' role='tablist' >
          {
            Object.keys(MediaTabs).map((id: MediaTabKey) => {
              return <li
                key={id}
                className='bp3-tab' role='tab'
                aria-selected={this.state.id === id} onClick={() => this.onSelect(id)
                }>
                {tx(id)}
              </li>
            })}
        </ul>
        < div className='bp3-tab-panel' role='tabpanel' >
          <div className='gallery' >
            {
              medias.map((message:message) => {
                var msg = message.msg
                return <div className='item'
                  onClick={this.onClickMedia.bind(this, message)}
                  key={msg.id} >
                  <Attachment {
                    ...{
                      direction: msg.direction,
                      attachment: msg.attachment,
                      conversationType: 'direct',
                      message,
                      isInMediaView: true
                    }
                  } />
                </div>
              })
            }
          </div>
        </div>
      </div>
    </div>
  }
}

Media.contextType = ScreenContext
