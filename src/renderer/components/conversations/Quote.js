const React = require('react')
const classNames = require('classnames')
const MIME = require('./MIME')
const GoogleChrome = require('./GoogleChrome')
const MessageBody = require('./MessageBody')
const ContactName = require('./ContactName')

function validateQuote (quote) {
  if (quote.text) {
    return true
  }

  if (quote.attachment) {
    return true
  }

  return false
}

function getObjectUrl (thumbnail) {
  if (thumbnail && thumbnail.objectUrl) {
    return thumbnail.objectUrl
  }

  return null
}

function getTypeLabel ({ i18n, contentType, isVoiceMessage }) {
  if (GoogleChrome.isVideoTypeSupported(contentType)) {
    return i18n('video')
  }
  if (GoogleChrome.isImageTypeSupported(contentType)) {
    return i18n('photo')
  }
  if (MIME.isAudio(contentType) && isVoiceMessage) {
    return i18n('voiceMessage')
  }
  if (MIME.isAudio(contentType)) {
    return i18n('audio')
  }

  return null
}

class Quote extends React.Component {
  renderImage (url, i18n, icon) {
    const iconElement = icon ? (
      <div className='module-quote__icon-container__inner'>
        <div className='module-quote__icon-container__circle-background'>
          <div
            className={classNames(
              'module-quote__icon-container__icon',
              `module-quote__icon-container__icon--${icon}`
            )}
          />
        </div>
      </div>
    ) : null

    return (
      <div className='module-quote__icon-container'>
        <img src={url} alt={i18n('quoteThumbnailAlt')} />
        {iconElement}
      </div>
    )
  }

  renderIcon (icon) {
    return (
      <div className='module-quote__icon-container'>
        <div className='module-quote__icon-container__inner'>
          <div className='module-quote__icon-container__circle-background'>
            <div
              className={classNames(
                'module-quote__icon-container__icon',
                `module-quote__icon-container__icon--${icon}`
              )}
            />
          </div>
        </div>
      </div>
    )
  }

  renderGenericFile () {
    const { attachment, isIncoming } = this.props

    if (!attachment) {
      return
    }

    const { fileName, contentType } = attachment
    const isGenericFile =
      !GoogleChrome.isVideoTypeSupported(contentType) &&
      !GoogleChrome.isImageTypeSupported(contentType) &&
      !MIME.isAudio(contentType)

    if (!isGenericFile) {
      return null
    }

    return (
      <div className='module-quote__generic-file'>
        <div className='module-quote__generic-file__icon' />
        <div
          className={classNames(
            'module-quote__generic-file__text',
            isIncoming ? 'module-quote__generic-file__text--incoming' : null
          )}
        >
          {fileName}
        </div>
      </div>
    )
  }

  renderIconContainer () {
    const { attachment, i18n } = this.props
    if (!attachment) {
      return null
    }

    const { contentType, thumbnail } = attachment
    const objectUrl = getObjectUrl(thumbnail)

    if (GoogleChrome.isVideoTypeSupported(contentType)) {
      return objectUrl
        ? this.renderImage(objectUrl, i18n, 'play')
        : this.renderIcon('movie')
    }
    if (GoogleChrome.isImageTypeSupported(contentType)) {
      return objectUrl
        ? this.renderImage(objectUrl, i18n)
        : this.renderIcon('image')
    }
    if (MIME.isAudio(contentType)) {
      return this.renderIcon('microphone')
    }

    return null
  }

  renderText () {
    const { i18n, text, attachment, isIncoming } = this.props

    if (text) {
      return (
        <div
          dir='auto'
          className={classNames(
            'module-quote__primary__text',
            isIncoming ? 'module-quote__primary__text--incoming' : null
          )}
        >
          <MessageBody text={text} i18n={i18n} />
        </div>
      )
    }

    if (!attachment) {
      return null
    }

    const { contentType, isVoiceMessage } = attachment

    const typeLabel = getTypeLabel({ i18n, contentType, isVoiceMessage })
    if (typeLabel) {
      return (
        <div
          className={classNames(
            'module-quote__primary__type-label',
            isIncoming ? 'module-quote__primary__type-label--incoming' : null
          )}
        >
          {typeLabel}
        </div>
      )
    }

    return null
  }

  renderClose () {
    const { onClose } = this.props

    if (!onClose) {
      return null
    }

    // We don't want the overall click handler for the quote to fire, so we stop
    //   propagation before handing control to the caller's callback.
    const onClick = (e) => {
      e.stopPropagation()
      onClose()
    }

    // We need the container to give us the flexibility to implement the iOS design.
    return (
      <div className='module-quote__close-container'>
        <div
          className='module-quote__close-button'
          role='button'
          onClick={onClick}
        />
      </div>
    )
  }

  renderAuthor () {
    const {
      authorProfileName,
      authorPhoneNumber,
      authorName,
      authorColor,
      i18n,
      isFromMe,
      isIncoming
    } = this.props

    return (
      <div
        className={classNames(
          'module-quote__primary__author',
          !isFromMe ? `module-quote__primary__author--${authorColor}` : null,
          isIncoming ? 'module-quote__primary__author--incoming' : null
        )}
      >
        {isFromMe ? (
          i18n('you')
        ) : (
          <ContactName
            phoneNumber={authorPhoneNumber}
            name={authorName}
            profileName={authorProfileName}
            i18n={i18n}
          />
        )}
      </div>
    )
  }

  renderReferenceWarning () {
    const { i18n, isIncoming, referencedMessageNotFound } = this.props

    if (!referencedMessageNotFound) {
      return null
    }

    return (
      <div
        className={classNames(
          'module-quote__reference-warning',
          isIncoming ? 'module-quote__reference-warning--incoming' : null
        )}
      >
        <div
          className={classNames(
            'module-quote__reference-warning__icon',
            isIncoming
              ? 'module-quote__reference-warning__icon--incoming'
              : null
          )}
        />
        <div
          className={classNames(
            'module-quote__reference-warning__text',
            isIncoming
              ? 'module-quote__reference-warning__text--incoming'
              : null
          )}
        >
          {i18n('originalMessageNotFound')}
        </div>
      </div>
    )
  }

  render () {
    const {
      authorColor,
      isFromMe,
      isIncoming,
      onClick,
      referencedMessageNotFound,
      withContentAbove
    } = this.props

    if (!validateQuote(this.props)) {
      return null
    }

    return (
      <div
        className={classNames(
          'module-quote-container',
          withContentAbove ? 'module-quote-container--with-content-above' : null
        )}
      >
        <div
          onClick={onClick}
          role='button'
          className={classNames(
            'module-quote',
            isIncoming ? 'module-quote--incoming' : 'module-quote--outgoing',
            !isIncoming && !isFromMe
              ? `module-quote--outgoing-${authorColor}`
              : null,
            !isIncoming && isFromMe ? 'module-quote--outgoing-you' : null,
            !onClick ? 'module-quote--no-click' : null,
            withContentAbove ? 'module-quote--with-content-above' : null,
            referencedMessageNotFound
              ? 'module-quote--with-reference-warning'
              : null
          )}
        >
          <div className='module-quote__primary'>
            {this.renderAuthor()}
            {this.renderGenericFile()}
            {this.renderText()}
          </div>
          {this.renderIconContainer()}
          {this.renderClose()}
        </div>
        {this.renderReferenceWarning()}
      </div>
    )
  }
}

module.exports = Quote
