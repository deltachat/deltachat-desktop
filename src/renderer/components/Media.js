import { onDownload } from './message/messageFunctions'
import React from 'react'
import C from 'deltachat-node/constants'
import { ipcRenderer } from 'electron'
import styled from 'styled-components'

import ScreenContext from '../contexts/ScreenContext'
import Attachment, { isVideo, isImage } from './message/Attachment'

const Wrapper = styled.div`
  width: 70%;
  background-color: ${props => props.theme.galleryBg};
  float: right;
  padding: 10px;
  margin-top: 50px;
`
const MediaGallery = styled.div`
  height: calc(100vh - 50px - 40px - 10px);
  overflow: scroll;
  padding-top: 20px;
`

const MediaGalleryItem = styled.div`
  float: left;

  .module-message__attachment-container {
    background-color: transparent;
    border-radius: 0px;
    margin: 0px !important;
  }

  .module-message__img-attachment {
    width: 120pt !important;
    height: 120pt !important;
  }

  .module-message__generic-attachment__text {
    div { color: black !important; }
  }


`

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
    const medias = ipcRenderer.sendSync(
      'getChatMedia',
      msgTypes[0],
      msgTypes[1]
    )
    this.setState({ id, msgTypes, medias })
  }

  onClickMedia (message, ev) {
    ev.preventDefault()
    ev.stopPropagation()
    const attachment = message.msg.attachment
    if (
      message.filemime === 'application/octet-stream' &&
      !(isVideo(attachment) || isImage(attachment))
    ) {
      onDownload(message.msg)
    } else {
      this.context.openDialog('RenderMedia', { message })
    }
  }

  render () {
    const { medias } = this.state
    const tx = window.translate
    return <Wrapper>
      <div class='bp3-tabs' style={{ minWidth: 200 }}>
        <ul class='bp3-tab-list .modifier' role='tablist'>
          {Object.keys(GROUPS).map((id) => {
            return <li
              key={id}
              class='bp3-tab' role='tab'
              aria-selected={this.state.id === id} onClick={() => this.onSelect(id)}>
              {tx(id)}
            </li>
          })}
        </ul>
        <div class='bp3-tab-panel' role='tabpanel'>
          <MediaGallery>
            {medias.map((message) => {
              var msg = message.msg
              return <MediaGalleryItem
                onClick={this.onClickMedia.bind(this, message)}
                key={msg.id}>
                <Attachment {...{
                  direction: msg.direction,
                  attachment: msg.attachment,
                  conversationType: 'direct',
                  message
                }} />
              </MediaGalleryItem>
            })}
          </MediaGallery>
        </div>
      </div>
    </Wrapper>
  }
}

Media.contextType = ScreenContext
