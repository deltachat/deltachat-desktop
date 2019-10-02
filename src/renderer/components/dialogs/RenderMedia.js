const React = require('react')
const styled = require('styled-components').default
const createGlobalStyle = require('styled-components').createGlobalStyle
const { Icon, Overlay } = require('@blueprintjs/core')

const OverlayGlobal = createGlobalStyle`
`

const Container = styled.div`
    height: 100%;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    
    img, video {
      width: 100vw;
      max-height: 100vh;
      object-fit: contain;
    }
    video {
      width: 95vw;
    }
`

const RenderMediaWrapper = styled.div`
  width: 100vw;
  height: 100vh;
`

const CloseButtonWrapper = styled.div`
  float: right;
  position: absolute;
  right: 5px;
  cursor: pointer;
  z-index: 10;
`

const DownloadButtonWrapper = styled.div`
  float: right;
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 10;
`

class RenderMedia extends React.Component {
  render () {
    const tx = window.translate
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
        elm = <div className='image-container'><img src={url} /></div>
        break
      case 'audio':
        elm = <audio src={url} controls={1} />
        break
      case 'video':
        elm = <video src={url} controls={1} autoplay />
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
              <Icon onClick={onClose} icon='cross' iconSize={32} color={'grey'} aria-label={tx('close')} />
            </CloseButtonWrapper>
          }
          <Container>
            {elm}
          </Container>
          <DownloadButtonWrapper>
            <div role='button'
              onClick={message.onDownload}
              className='module-message__buttons__download module-message__buttons__download--outgoing icon-medium'
              aria-label={tx('save')} />
          </DownloadButtonWrapper>
        </RenderMediaWrapper>
      </Overlay>
    )
  }
}

module.exports = RenderMedia
