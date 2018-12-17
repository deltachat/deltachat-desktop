const React = require('react')
const styled = require('styled-components').default
const { Overlay } = require('@blueprintjs/core')

const RenderMediaWrapper = styled.div`
  .attachment-overlay {
    display: flex;
    justify-content: center;
  }
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
        elm = <iframe width='100%' height='100%' src={url} />
    }
    return <RenderMediaWrapper>
      <Overlay isOpen={Boolean(url)}
        className='attachment-overlay'
        onClose={onClose}>
        {elm}
      </Overlay>
    </RenderMediaWrapper>
  }
}

module.exports = RenderMedia
