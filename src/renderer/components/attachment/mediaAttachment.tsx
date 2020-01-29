import React, { useContext } from 'react';
import classNames from 'classnames';
import { openAttachmentInShell, onDownload } from '../message/messageFunctions';
import { ScreenContext } from '../../contexts';
import { isDisplayableByFullscreenMedia, isImage, isVideo, isAudio, getExtension, dragAttachmentOut, attachment } from './Attachment';

type AttachmentProps = { // TODO: replace "any" by the right type here
  attachment: attachment,
  message: any
}

export default function MediaAttachment({ attachment, message }: AttachmentProps) {
  const tx = (window as any).translate;
  if (!attachment) {
    return null;
  }
  const { openDialog } = useContext(ScreenContext);
  const msg = message.msg;
  const onClickAttachment = (ev: any) => {
    ev.stopPropagation();
    if (isDisplayableByFullscreenMedia(message.msg.attachment)) {
      openDialog('FullscreenMedia', { message });
    }
    else {
      openAttachmentInShell(msg);
    }
  };
  if (isImage(attachment)) {
    if (!attachment.url) {
      return (<div className='message-attachment-broken-media'>
        {tx('imageFailedToLoad')}
      </div>);
    }
    return (<div onClick={onClickAttachment} role='button' className='message-attachment-media'>
      <img className='attachment-content' src={attachment.url} />
    </div>);
  }
  else if (isVideo(attachment)) {
    if (!attachment.url) {
      return (<div role='button' className='message-attachment-broken-media'>
        {tx('videoScreenshotFailedToLoad')}
      </div>);
    }
    return (<div onClick={onClickAttachment} role='button' className='message-attachment-media'>
    <video className='attachment-content' src={attachment.url} controls={false} />
    <div className='video-play-btn'>
        <div className='video-play-btn-icon' />
    </div>
    </div>);
  }
  else if (isAudio(attachment)) {
    return (<audio controls className='message-attachment-audio'>
      <source src={attachment.url} />
    </audio>);
  }
  else {
    const { fileName, fileSize, contentType } = attachment;
    const extension = getExtension(attachment);
    return (<div className='module-message__generic-attachment' role='button' onClick={(ev) => {onDownload(message.msg)}}>
      <div className='module-message__generic-attachment__icon' draggable='true' onClick={onClickAttachment} onDragStart={dragAttachmentOut.bind(null, attachment)} title={contentType}>
        {extension ? (<div className='module-message__generic-attachment__icon__extension'>
          {contentType === 'application/octet-stream' ? '' : extension}
        </div>) : null}
      </div>
      <div className='module-message__generic-attachment__text'>
        <div className={classNames('module-message__generic-attachment__file-name')}>
          {fileName}
        </div>
        <div className={classNames('module-message__generic-attachment__file-size')}>
          {fileSize}
        </div>
      </div>
    </div>);
  }
}
