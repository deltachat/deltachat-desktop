const React = require('react')
const styled = require('styled-components').default
const createGlobalStyle = require('styled-components').createGlobalStyle
const { Button, Overlay } = require('@blueprintjs/core')

const OverlayGlobal = createGlobalStyle`
  .bp3-overlay-backdrop {
    background-color: rgba(16, 22, 26, 1);
  }
`

const Container = styled.div`
    height: 100%;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    
    img {
      max-width: 90vw;
      max-height: 100vh;
    }
`

const RenderMediaWrapper = styled.div`
  width: 100vw;
  height: 100vh;
`

const CloseButtonWrapper = styled.div`
  float: right;
  position: absolute;
  right: 0;
`

const DownloadButtonWrapper = styled.div`
  float: right;
  position: absolute;
  right: 0;
  bottom: 0;
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
    return (
        <Overlay isOpen={Boolean(url)}
        className='attachment-overlay'
        onClose={onClose}>
          <OverlayGlobal />
          <RenderMediaWrapper>
            {elm &&
              <CloseButtonWrapper>
                <Button minimal onClick={onClose} icon='cross' />
              </CloseButtonWrapper>
            }
            <Container>
              {elm}
            </Container>
            <DownloadButtonWrapper>
              <Button minimal onClick={message.onDownload} icon='download'/>
            </DownloadButtonWrapper>
          </RenderMediaWrapper>
        </Overlay>
    )
  }
}

module.exports = RenderMedia
