const React = require('react')
const styled = require('styled-components').default
const { Button, Overlay } = require('@blueprintjs/core')

const RenderMediaWrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
`

const Exit = styled.div`
  float: right;
  position: absolute;
  right: 0;
`

class RenderMedia extends React.Component {
  render () {
    const { message, onClose } = this.props
    let elm = <div />
    if (!message || !message.msg || !message.msg.attachment) return elm
    const attachment = message.msg.attachment
    const url = attachment.url
    const contentType = attachment.contentType

    // TODO: there must be a stable external library for figuring out the right
    // html element to render
    switch (contentType.split('/')[0]) {
      case 'image':
        elm = <img src={url} />
        break
      case 'audio':
        elm = <audio src={url} controls='true' />
        break
      case 'video':
        elm = <video src={url} controls='true' />
        break
      default:
        elm = null
    }
    return <Overlay isOpen={Boolean(url)}
      className='attachment-overlay'
      onClose={onClose}>
      <RenderMediaWrapper>
        {elm &&
          <Exit>
            <Button minimal large onClick={onClose} icon='cross' />
          </Exit>
        }
        {elm}
        <Button large onClick={message.onDownload} icon='download'>
          {message.filename}
        </Button>
      </RenderMediaWrapper>
    </Overlay>
  }
}

module.exports = RenderMedia
