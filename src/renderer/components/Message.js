const React = require('react')
const classNames = require('classnames')
const { MessageBody, Quote, EmbeddedContact, Timestamp } = require('./conversations')
const { ExpireTimer, getIncrement } = require('../../../conversations/build/components/conversation/ExpireTimer')
const ContactName = require('./ContactName')
const { ContextMenu, ContextMenuTrigger, MenuItem } = require('react-contextmenu')
const {
  isImageTypeSupported,
  isVideoTypeSupported
} = require('../../../conversations/build/util/GoogleChrome')

const { ipcRenderer } = require('electron')

const MIME = require('../../../conversations/build/types/MIME')

const mimeTypes = require('mime-types')

const MINIMUM_IMG_HEIGHT = 150
const MAXIMUM_IMG_HEIGHT = 300
const EXPIRATION_CHECK_MINIMUM = 2000
const EXPIRED_DELAY = 600

function isImage (attachment) {
  return (
    attachment &&
    attachment.contentType &&
    isImageTypeSupported(attachment.contentType)
  )
}

function hasImage (attachment) {
  return attachment && attachment.url
}

function isVideo (attachment) {
  return (
    attachment &&
    attachment.contentType &&
    isVideoTypeSupported(attachment.contentType)
  )
}

function hasVideoScreenshot (attachment) {
  return attachment && attachment.screenshot && attachment.screenshot.url
}

function isAudio (attachment) {
  return (
    attachment && attachment.contentType && MIME.isAudio(attachment.contentType)
  )
}

function getExtension ({ fileName, contentType }) {
  if (fileName && fileName.indexOf('.') >= 0) {
    const lastPeriod = fileName.lastIndexOf('.')
    const extension = fileName.slice(lastPeriod + 1)
    if (extension.length) {
      return extension
    }
  }

  return mimeTypes.extension(contentType) || null
}

function dragAttachmentOut (attachment, dragEvent) {
  dragEvent.preventDefault()
  ipcRenderer.send('ondragstart', attachment.url)
}

class Message extends React.Component {
  constructor (props) {
    super(props)

    this.captureMenuTrigger = this.captureMenuTrigger.bind(this)
    this.showMenu = this.showMenu.bind(this)

    this.menuTriggerRef = null
    this.expirationCheckInterval = null
    this.expiredTimeout = null

    this.state = {
      expiring: false,
      expired: false,
      imageBroken: false
    }
  }

  componentDidMount () {
    const { expirationLength } = this.props
    if (!expirationLength) {
      return
    }

    const increment = getIncrement(expirationLength)
    const checkFrequency = Math.max(EXPIRATION_CHECK_MINIMUM, increment)

    this.checkExpired()

    this.expirationCheckInterval = setInterval(() => {
      this.checkExpired()
    }, checkFrequency)
  }

  componentWillUnmount () {
    if (this.expirationCheckInterval) {
      clearInterval(this.expirationCheckInterval)
    }
    if (this.expiredTimeout) {
      clearTimeout(this.expiredTimeout)
    }
  }

  checkExpired () {
    const now = Date.now()
    const { expirationTimestamp, expirationLength } = this.props

    if (!expirationTimestamp || !expirationLength) {
      return
    }

    if (now >= expirationTimestamp) {
      this.setState({
        expiring: true
      })

      const setExpired = () => {
        this.setState({
          expired: true
        })
      }
      this.expiredTimeout = setTimeout(setExpired, EXPIRED_DELAY)
    }
  }

  handleImageError () {
    // tslint:disable-next-line no-console
    console.log('Message: Image failed to load; failing over to placeholder')
    this.setState({
      imageBroken: true
    })
  }

  renderAvatar () {
    const {
      authorName,
      authorPhoneNumber,
      authorProfileName,
      authorAvatarPath,
      authorColor,
      collapseMetadata,
      conversationType,
      direction,
      i18n
    } = this.props

    const title = `${authorName || authorPhoneNumber}${
      !authorName && authorProfileName ? ` ~${authorProfileName}` : ''
    }`

    if (
      collapseMetadata ||
      conversationType !== 'group' ||
      direction === 'outgoing'
    ) {
      return
    }

    if (!authorAvatarPath) {
      const label = authorName ? (authorName.trim()[0] || '#') : '#'
      const color = authorColor || 'green'

      return (
        <div className={classNames(
          'module-message__author-default-avatar'
        )}
        >
          <div
            style={{ 'backgroundColor': color }}
            className='module-message__author-default-avatar__label'>
            {label}
          </div>
        </div>
      )
    }

    return (
      <div className='module-message__author-avatar'>
        <img alt={i18n('contactAvatarAlt', [title])} src={authorAvatarPath} />
      </div>
    )
  }

  renderError (isCorrectSide) {
    const { status, direction } = this.props

    if (!isCorrectSide || status !== 'error') {
      return null
    }

    return (
      <div className='module-message__error-container'>
        <div
          className={classNames(
            'module-message__error',
            `module-message__error--${direction}`
          )}
        />
      </div>
    )
  }

  renderAuthor () {
    const {
      authorName,
      authorPhoneNumber,
      authorProfileName,
      conversationType,
      direction,
      i18n,
      authorColor
    } = this.props

    const title = authorName || authorPhoneNumber

    if (direction !== 'incoming' || conversationType !== 'group' || !title) {
      return null
    }

    return (
      <div className='module-message__author'>
        <ContactName
          phoneNumber={authorPhoneNumber}
          name={authorName}
          profileName={authorProfileName}
          module='module-message__author'
          i18n={i18n}
          color={authorColor}
        />
      </div>
    )
  }

  renderText () {
    const { text, i18n, direction, status } = this.props

    const contents =
      direction === 'incoming' && status === 'error'
        ? i18n('incomingError')
        : text

    if (!contents) {
      return null
    }

    return (
      <div
        dir='auto'
        className={classNames(
          'module-message__text',
          `module-message__text--${direction}`,
          status === 'error' && direction === 'incoming'
            ? 'module-message__text--error'
            : null
        )}
      >
        <MessageBody text={contents || ''} i18n={i18n} />
      </div>
    )
  }

  renderQuote () {
    const { conversationType, direction, i18n, quote } = this.props

    if (!quote) {
      return null
    }

    const withContentAbove =
      conversationType === 'group' && direction === 'incoming'

    return (
      <Quote
        i18n={i18n}
        onClick={quote.onClick}
        text={quote.text}
        attachment={quote.attachment}
        isIncoming={direction === 'incoming'}
        authorPhoneNumber={quote.authorPhoneNumber}
        authorProfileName={quote.authorProfileName}
        authorName={quote.authorName}
        authorColor={quote.authorColor}
        referencedMessageNotFound={quote.referencedMessageNotFound}
        isFromMe={quote.isFromMe}
        withContentAbove={withContentAbove}
      />
    )
  }

  renderEmbeddedContact () {
    const {
      collapseMetadata,
      contact,
      conversationType,
      direction,
      i18n,
      text
    } = this.props
    if (!contact) {
      return null
    }

    const withCaption = Boolean(text)
    const withContentAbove =
      conversationType === 'group' && direction === 'incoming'
    const withContentBelow = withCaption || !collapseMetadata

    return (
      <EmbeddedContact
        contact={contact}
        hasSignalAccount={contact.hasSignalAccount}
        isIncoming={direction === 'incoming'}
        i18n={i18n}
        onClick={contact.onClick}
        withContentAbove={withContentAbove}
        withContentBelow={withContentBelow}
      />
    )
  }

  renderSendMessageButton () {
    const { contact, i18n } = this.props
    if (!contact || !contact.hasSignalAccount) {
      return null
    }

    return (
      <div
        role='button'
        onClick={contact.onSendMessage}
        className='module-message__send-message-button'
      >
        {i18n('sendMessageToContact')}
      </div>
    )
  }

  renderAttachment () {
    const {
      i18n,
      attachment,
      text,
      collapseMetadata,
      conversationType,
      direction,
      quote,
      onClickAttachment
    } = this.props
    const { imageBroken } = this.state

    if (!attachment) {
      return null
    }

    const withCaption = Boolean(text)
    // For attachments which aren't full-frame
    const withContentBelow = withCaption || !collapseMetadata
    const withContentAbove =
      quote || (conversationType === 'group' && direction === 'incoming')

    if (isImage(attachment)) {
      if (imageBroken || !attachment.url) {
        return (
          <div
            className={classNames(
              'module-message__broken-image',
              `module-message__broken-image--${direction}`
            )}
          >
            {i18n('imageFailedToLoad')}
          </div>
        )
      }

      // Calculating height to prevent reflow when image loads
      const height = Math.max(MINIMUM_IMG_HEIGHT, attachment.height || 0)

      return (
        <div
          onClick={onClickAttachment}
          role='button'
          className={classNames(
            'module-message__attachment-container',
            withCaption
              ? 'module-message__attachment-container--with-content-below'
              : null,
            withContentAbove
              ? 'module-message__attachment-container--with-content-above'
              : null
          )}
        >
          <img
            onError={this.handleImageErrorBound}
            className='module-message__img-attachment'
            height={Math.min(MAXIMUM_IMG_HEIGHT, height)}
            src={attachment.url}
            alt={i18n('imageAttachmentAlt')}
          />
          <div
            className={classNames(
              'module-message__img-border-overlay',
              withCaption
                ? 'module-message__img-border-overlay--with-content-below'
                : null,
              withContentAbove
                ? 'module-message__img-border-overlay--with-content-above'
                : null
            )}
          />
          {!withCaption && !collapseMetadata ? (
            <div className='module-message__img-overlay' />
          ) : null}
        </div>
      )
    } else if (isVideo(attachment)) {
      if (imageBroken || !attachment.url) {
        return (
          <div
            role='button'
            onClick={onClickAttachment}
            className={classNames(
              'module-message__broken-video-screenshot',
              `module-message__broken-video-screenshot--${direction}`
            )}
          >
            {i18n('videoScreenshotFailedToLoad')}
          </div>
        )
      }

      // Calculating height to prevent reflow when image loads
      const height = Math.max(MINIMUM_IMG_HEIGHT, 0)

      return (
        <div
          onClick={onClickAttachment}
          role='button'
          className={classNames(
            'module-message__attachment-container',
            withCaption
              ? 'module-message__attachment-container--with-content-below'
              : null,
            withContentAbove
              ? 'module-message__attachment-container--with-content-above'
              : null
          )}
        >
          <video
            onError={this.handleImageErrorBound}
            className='module-message__img-attachment'
            height={Math.min(MAXIMUM_IMG_HEIGHT, height)}
            src={attachment.url}
          />
          <div
            className={classNames(
              'module-message__img-border-overlay',
              withCaption
                ? 'module-message__img-border-overlay--with-content-below'
                : null,
              withContentAbove
                ? 'module-message__img-border-overlay--with-content-above'
                : null
            )}
          />
          {!withCaption && !collapseMetadata ? (
            <div className='module-message__img-overlay' />
          ) : null}
          <div className='module-message__video-overlay__circle'>
            <div className='module-message__video-overlay__play-icon' />
          </div>
        </div>
      )
    } else if (isAudio(attachment)) {
      return (
        <audio
          controls
          className={classNames(
            'module-message__audio-attachment',
            withContentBelow
              ? 'module-message__audio-attachment--with-content-below'
              : null,
            withContentAbove
              ? 'module-message__audio-attachment--with-content-above'
              : null
          )}
        >
          <source src={attachment.url} />
        </audio>
      )
    } else {
      const { fileName, fileSize, contentType } = attachment
      const extension = getExtension({ contentType, fileName })

      return (
        <div
          className={classNames(
            'module-message__generic-attachment',
            withContentBelow
              ? 'module-message__generic-attachment--with-content-below'
              : null,
            withContentAbove
              ? 'module-message__generic-attachment--with-content-above'
              : null
          )}
        >
          <div
            className='module-message__generic-attachment__icon'
            draggable='true'
            onDragStart={dragAttachmentOut.bind(null, attachment)}
            title={contentType}
          >
            {extension ? (
              <div className='module-message__generic-attachment__icon__extension'>
                { contentType === 'application/octet-stream' ? '' : extension}
              </div>
            ) : null}
          </div>
          <div className='module-message__generic-attachment__text'>
            <div
              className={classNames(
                'module-message__generic-attachment__file-name',
                `module-message__generic-attachment__file-name--${direction}`
              )}
            >
              {fileName}
            </div>
            <div
              className={classNames(
                'module-message__generic-attachment__file-size',
                `module-message__generic-attachment__file-size--${direction}`
              )}
            >
              {fileSize}
            </div>
          </div>
        </div>
      )
    }
  }

  renderMetadata () {
    const {
      padlock,
      attachment,
      collapseMetadata,
      direction,
      expirationLength,
      expirationTimestamp,
      i18n,
      status,
      text,
      timestamp
    } = this.props
    const { imageBroken } = this.state

    if (collapseMetadata) {
      return null
    }

    const withImageNoCaption = Boolean(
      !text &&
        !imageBroken &&
        ((isImage(attachment) && hasImage(attachment)) ||
          (isVideo(attachment) && hasVideoScreenshot(attachment)))
    )
    const showError = status === 'error' && direction === 'outgoing'

    return (
      <div
        className={classNames(
          'module-message__metadata',
          withImageNoCaption
            ? 'module-message__metadata--with-image-no-caption'
            : null
        )}
      >
        {padlock === true && status !== 'error' ? (
          <div
            className={classNames(
              'module-message__metadata__padlock-icon',
              `module-message__metadata__padlock-icon--${direction}`
            )}
          />
        ) : null}
        {showError ? (
          <span
            className={classNames(
              'module-message__metadata__date',
              `module-message__metadata__date--${direction}`,
              withImageNoCaption
                ? 'module-message__metadata__date--with-image-no-caption'
                : null
            )}
          >
            {i18n('sendFailed')}
          </span>
        ) : (
          <Timestamp
            i18n={i18n}
            timestamp={timestamp}
            extended
            direction={direction}
            withImageNoCaption={withImageNoCaption}
            module='module-message__metadata__date'
          />
        )}
        {expirationLength && expirationTimestamp ? (
          <ExpireTimer
            direction={direction}
            expirationLength={expirationLength}
            expirationTimestamp={expirationTimestamp}
            withImageNoCaption={withImageNoCaption}
          />
        ) : null}
        <span className='module-message__metadata__spacer' />
        {direction === 'outgoing' && status !== 'error' ? (
          <div
            className={classNames(
              'module-message__metadata__status-icon',
              `module-message__metadata__status-icon--${status}`,
              withImageNoCaption
                ? 'module-message__metadata__status-icon--with-image-no-caption'
                : null
            )}
          />
        ) : null}
      </div>
    )
  }

  captureMenuTrigger (triggerRef) {
    this.menuTriggerRef = triggerRef
  }

  showMenu (event) {
    if (this.menuTriggerRef) {
      this.menuTriggerRef.handleContextClick(event)
    }
  }

  renderMenu (isCorrectSide, triggerId) {
    const {
      attachment,
      direction,
      disableMenu,
      onDownload,
      onReply
    } = this.props

    if (!isCorrectSide || disableMenu) {
      return null
    }

    const downloadButton = attachment ? (
      <div
        onClick={onDownload}
        role='button'
        className={classNames(
          'module-message__buttons__download',
          `module-message__buttons__download--${direction}`
        )}
      />
    ) : null

    const replyButton = (
      <div
        onClick={onReply}
        role='button'
        className={classNames(
          'module-message__buttons__reply',
          `module-message__buttons__download--${direction}`
        )}
      />
    )

    const menuButton = (
      <ContextMenuTrigger id={triggerId} ref={this.captureMenuTrigger}>
        <div
          role='button'
          onClick={this.showMenu}
          className={classNames(
            'module-message__buttons__menu',
            `module-message__buttons__download--${direction}`
          )}
        />
      </ContextMenuTrigger>
    )

    const first = direction === 'incoming' ? downloadButton : menuButton
    const last = direction === 'incoming' ? menuButton : downloadButton

    return (
      <div
        className={classNames(
          'module-message__buttons',
          `module-message__buttons--${direction}`
        )}
      >
        {first}
        {replyButton}
        {last}
      </div>
    )
  }

  renderContextMenu (triggerId) {
    const {
      attachment,
      direction,
      status,
      onDelete,
      onDownload,
      onReply,
      onForward,
      onRetrySend,
      onShowDetail,
      i18n
    } = this.props

    const showRetry = status === 'error' && direction === 'outgoing'

    return (
      <ContextMenu id={triggerId}>
        {attachment ? (
          <MenuItem
            attributes={{
              className: 'module-message__context__download'
            }}
            onClick={onDownload}
          >
            {i18n('downloadAttachment')}
          </MenuItem>
        ) : null}
        <MenuItem
          attributes={{
            className: 'module-message__context__reply'
          }}
          onClick={onReply}
        >
          {i18n('replyToMessage')}
        </MenuItem>
        <MenuItem
          attributes={{
            className: 'module-message__context__forward'
          }}
          onClick={onForward}
        >
          {i18n('forwardMessage')}
        </MenuItem>
        <MenuItem
          attributes={{
            className: 'module-message__context__more-info'
          }}
          onClick={onShowDetail}
        >
          {i18n('moreInfo')}
        </MenuItem>
        {showRetry ? (
          <MenuItem
            attributes={{
              className: 'module-message__context__retry-send'
            }}
            onClick={onRetrySend}
          >
            {i18n('retrySend')}
          </MenuItem>
        ) : null}
        <MenuItem
          attributes={{
            className: 'module-message__context__delete-message'
          }}
          onClick={onDelete}
        >
          {i18n('deleteMessage')}
        </MenuItem>
      </ContextMenu>
    )
  }

  render () {
    const {
      authorPhoneNumber,
      authorColor,
      direction,
      id,
      timestamp
    } = this.props
    const { expired, expiring } = this.state

    // This id is what connects our triple-dot click with our associated pop-up menu.
    //   It needs to be unique.
    const triggerId = String(id || `${authorPhoneNumber}-${timestamp}`)

    if (expired) {
      return null
    }

    return (
      <div
        className={classNames(
          'module-message',
          `module-message--${direction}`,
          expiring ? 'module-message--expired' : null
        )}
      >
        {this.renderAvatar()}
        {this.renderError(direction === 'incoming')}
        {this.renderMenu(direction === 'outgoing', triggerId)}
        <div
          className={classNames(
            'module-message__container',
            `module-message__container--${direction}`,
            direction === 'incoming'
              ? `module-message__container--incoming-${authorColor}`
              : null
          )}
        >
          {this.renderAuthor()}
          {this.renderQuote()}
          {this.renderAttachment()}

          {this.renderText()}
          {this.renderMetadata()}
          {this.renderSendMessageButton()}
        </div>
        {this.renderError(direction === 'outgoing')}
        {this.renderMenu(direction === 'incoming', triggerId)}
        {this.renderContextMenu(triggerId)}
      </div>
    )
  }
}

module.exports = Message
