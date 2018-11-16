const React = require('react')
const { Overlay } = require('@blueprintjs/core')

class RenderMedia extends React.Component {
  render () {
    const { message, onClose } = this.props
    let elm = <div />
    if (!message.attachment) return elm

    const url = message.attachment.url
    const contentType = message.attachment.contentType

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
    return <Overlay isOpen={Boolean(url)}
      onClose={onClose}>
      {elm}
    </Overlay>
  }
}

module.exports = RenderMedia
