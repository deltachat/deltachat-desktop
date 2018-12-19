const React = require('react')
const C = require('deltachat-node/constants')
const { ipcRenderer } = require('electron')
const {
  Button, ButtonGroup
} = require('@blueprintjs/core')

const styled = require('styled-components').default

const MessageWrapper = require('./MessageWrapper')
const Attachment = require('./Attachment')

const Wrapper = styled.div`
  width: 70%;
  background-color: #eeefef;
  float: right;
  padding: 10px;
`
const MediaGallery = styled.div`
  height: calc(100vh - 50px - 40px);
  overflow: scroll;
  padding-top: 20px;
`

const THUMBNAIL_SIZE = '80px'

const MediaGalleryItem = styled.div`
  float: left;

  .module-message__attachment-container {
    background-color: transparent;
    border-radius: 0px;
    margin: 0px !important;
  }

  .module-message__img-border-overlay {
    display: none;
  }

  .module-message__img-attachment {
    max-height: ${THUMBNAIL_SIZE};
    min-height: ${THUMBNAIL_SIZE};
    max-width: ${THUMBNAIL_SIZE};
    min-width: ${THUMBNAIL_SIZE};
  }

  .module-message__generic-attachment__text {
    div { color: black !important; }
  }


`

const GROUPS = {
  images: {
    key: 'Images',
    values: [C.DC_MSG_GIF, C.DC_MSG_IMAGE]
  },
  videos: {
    key: 'Videos',
    values: [C.DC_MSG_VIDEO]
  },
  audio: {
    key: 'Audio',
    values: [C.DC_MSG_AUDIO, C.DC_MSG_VOICE]
  },
  documents: {
    key: 'Documents',
    values: [C.DC_MSG_FILE]
  }
}

class Media extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      id: 'images',
      msgTypes: GROUPS.images.values,
      medias: []
    }
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
    this.onSelect('images')
  }

  onSelect (id) {
    const msgTypes = GROUPS[id].values

    var medias = ipcRenderer.sendSync('dispatchSync',
      'getChatMedia',
      msgTypes[0],
      msgTypes[1] || 0
    )
    this.setState({ id, msgTypes, medias })
  }

  onClickMedia (message) {
    this.props.openDialog('RenderMedia', { message })
  }

  render () {
    const { medias } = this.state
    const tx = window.translate
    return <Wrapper>
      <ButtonGroup style={{ minWidth: 200 }}>
        {Object.keys(GROUPS).map((id) => {
          return <Button
            key={id}
            disabled={this.state.id === id}
            onClick={() => this.onSelect(id)}>
            {tx(GROUPS[id].key)}
          </Button>
        })}
      </ButtonGroup>
      <MediaGallery>
        {medias.map((raw) => {
          var message = MessageWrapper.convert(raw)
          var msg = message.msg
          return <MediaGalleryItem
            onClick={this.onClickMedia.bind(this, message)}
            key={message.id}>
            {Attachment.render({
              i18n: window.translate,
              direction: msg.direction,
              attachment: msg.attachment,
              collapseMetadata: true,
              conversationType: 'direct'
            })}
          </MediaGalleryItem>
        })}
      </MediaGallery>
    </Wrapper>
  }
}

module.exports = Media
