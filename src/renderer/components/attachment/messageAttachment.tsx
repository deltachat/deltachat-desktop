import React, { useContext } from 'react';
import classNames from 'classnames';
import { openAttachmentInShell } from '../message/messageFunctions';
import { C } from 'deltachat-node/constants.enum';
import { ScreenContext } from '../../contexts';
import { isDisplayableByFullscreenMedia, isImage, isVideo, isAudio, getExtension, dragAttachmentOut, attachment } from './Attachment';

const MINIMUM_IMG_HEIGHT = 150
const MAXIMUM_IMG_HEIGHT = 300

type AttachmentProps = { // TODO: replace "any" by the right type here
  attachment: attachment,
  text?: any,
  conversationType: any,
  direction: any,
  message: any
}

export default function Attachment({ attachment, text, conversationType, direction, message }: AttachmentProps) {
  const tx = (window as any).translate;
  if (!attachment) {
    return null;
  }
  const { openDialog } = useContext(ScreenContext);
  const msg = message.msg;
  const onClickAttachment = (ev: any) => {
    if (msg.viewType === C.DC_MSG_STICKER)
      return;
    ev.stopPropagation();
    if (isDisplayableByFullscreenMedia(message.msg.attachment)) {
      openDialog('FullscreenMedia', { message });
    }
    else {
      openAttachmentInShell(msg);
    }
  };
  const withCaption = Boolean(text);
  // For attachments which aren't full-frame
  const withContentBelow = withCaption;
  const withContentAbove = conversationType === 'group' && direction === 'incoming';
  const dimensions = message.msg.dimensions || {};
  // Calculating height to prevent reflow when image loads
  const height = Math.max(MINIMUM_IMG_HEIGHT, dimensions.height || 0);
  if (isImage(attachment)) {
    const isSticker = message.msg.viewType === C.DC_MSG_STICKER;
    if (!attachment.url) {
      return (<div className={classNames('message-attachment-broken-media', direction)}>
        {tx('imageFailedToLoad')}
      </div>);
    }
    return (<div onClick={onClickAttachment} role='button' className={classNames('message-attachment-media', withCaption
      ? 'content-below'
      : null, withContentAbove
      ? 'content-above'
      : null)}>
      <img className='attachment-content' style={{ height: !isSticker && Math.min(MAXIMUM_IMG_HEIGHT, height) + 'px' }} src={attachment.url} />
    </div>);
  }
  else if (isVideo(attachment)) {
    if (!attachment.url) {
      return (<div role='button'
        onClick={onClickAttachment}
        style={{cursor:'pointer'}}
        className={classNames('message-attachment-broken-media', direction)}>
        {tx('videoScreenshotFailedToLoad')}
      </div>);
    }
    // the native fullscreen option is better right now so we don't need to open our own one
    return (<div className={classNames('message-attachment-media', withCaption
      ? 'content-below'
      : null, withContentAbove
      ? 'content-above'
      : null)}>
      <video className='attachment-content' style={{ height: Math.min(MAXIMUM_IMG_HEIGHT, height) + 'px' }} src={attachment.url} controls={true} />
    </div>);
  }
  else if (isAudio(attachment)) {
    return (<audio controls className={classNames('module-message__audio-attachment', withContentBelow
      ? 'module-message__audio-attachment--with-content-below'
      : null, withContentAbove
      ? 'module-message__audio-attachment--with-content-above'
      : null)}>
      <source src={attachment.url} />
    </audio>);
  }
  else {
    const { fileName, fileSize, contentType } = attachment;
    const extension = getExtension(attachment);
    return (<div className={classNames('module-message__generic-attachment', withContentBelow
      ? 'module-message__generic-attachment--with-content-below'
      : null, withContentAbove
      ? 'module-message__generic-attachment--with-content-above'
      : null)}>
      <div className='module-message__generic-attachment__icon' draggable='true' onClick={onClickAttachment} onDragStart={dragAttachmentOut.bind(null, attachment)} title={contentType}>
        {extension ? (<div className='module-message__generic-attachment__icon__extension'>
          {contentType === 'application/octet-stream' ? '' : extension}
        </div>) : null}
      </div>
      <div className='module-message__generic-attachment__text'>
        <div className={classNames('module-message__generic-attachment__file-name', `module-message__generic-attachment__file-name--${direction}`)}>
          {fileName}
        </div>
        <div className={classNames('module-message__generic-attachment__file-size')}>
          {fileSize}
        </div>
      </div>
    </div>);
  }
}
