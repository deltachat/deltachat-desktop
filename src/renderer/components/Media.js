import { onDownload } from './message/messageFunctions'
import React from 'react'
import C from 'deltachat-node/constants'
import { callDcMethodAsync } from '../ipc'

import { ScreenContext } from '../contexts'
import Attachment, { isDisplayableByFullscreenMedia } from './message/Attachment'

const GROUPS = {
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
}

const DEFAULT_STATE = {
  id: 'images',
  msgTypes: GROUPS.images.values,
  medias: []
}

export default class Media extends React.Component {
  constructor (props) {
    super(props)
    this.state = DEFAULT_STATE
  }

  componentDidMount () {
    this.onSelect(this.state.id)
  }

  componentDidUpdate (prevProps) {
    if (!prevProps.chat || (this.props.chat.id !== prevProps.chat.id)) {
      this.onSelect(this.state.id)
    }
  }

  componentWillUnmount () {
    this.setState(DEFAULT_STATE)
  }

  onSelect (id) {
    const msgTypes = GROUPS[id].values
    callDcMethodAsync('chat.getChatMedia', [msgTypes[0], msgTypes[1]])
      .then(medias => {
        this.setState({ id, msgTypes, medias })
        this.forceUpdate()
      })
  }

  onClickMedia (message, ev) {
    ev.preventDefault()
    ev.stopPropagation()
    const attachment = message.msg.attachment
    if (isDisplayableByFullscreenMedia(attachment)) {
      this.context.openDialog('FullscreenMedia', { message })
    } else {
      onDownload(message.msg)
    }
  }

  render () {
    const { medias } = this.state
    const tx = window.translate
    return <div className='media-view'>
      <div className='bp3-tabs' style={{ minWidth: 200 }}>
        <ul className='bp3-tab-list .modifier' role='tablist'>
          {Object.keys(GROUPS).map((id) => {
            return <li
              key={id}
              className='bp3-tab' role='tab'
              aria-selected={this.state.id === id} onClick={() => this.onSelect(id)}>
              {tx(id)}
            </li>
          })}
        </ul>
        <div className='bp3-tab-panel' role='tabpanel'>
          <div className='gallery'>
            {medias.map((message) => {
              var msg = message.msg
              return <div className='item'
                onClick={this.onClickMedia.bind(this, message)}
                key={msg.id}>
                <Attachment {...{
                  direction: msg.direction,
                  attachment: msg.attachment,
                  conversationType: 'direct',
                  message
                }} />
              </div>
            })}
          </div>
        </div>
      </div>
    </div>
  }
}

Media.contextType = ScreenContext
