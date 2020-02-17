import React, { useContext } from 'react';
import classNames from 'classnames';
import { openAttachmentInShell, onDownload } from '../message/messageFunctions';
import { ScreenContext } from '../../contexts';
import { isDisplayableByFullscreenMedia, isImage, isVideo, isAudio, getExtension, dragAttachmentOut, attachment } from './Attachment';
import Timestamp from '../conversations/Timestamp';

type AttachmentProps = { // TODO: replace "any" by the right type here
  attachment: attachment,
  message: any
}

export default function MediaAttachment({ attachment, message }: AttachmentProps) {
  const tx = window.translate;
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
      return (<div className='media-attachment-broken-media'>
        {tx('imageFailedToLoad')}
      </div>);
    }
    return (<div onClick={onClickAttachment} role='button' className='media-attachment-media'>
      <img className='attachment-content' src={attachment.url} />
    </div>);
  }
  else if (isVideo(attachment)) {
    if (!attachment.url) {
      return (<div role='button' className='media-attachment-broken-media'>
        {tx('videoScreenshotFailedToLoad')}
      </div>);
    }
    return (<div onClick={onClickAttachment} role='button' className='media-attachment-media'>
    <video className='attachment-content' src={attachment.url} controls={false} />
    <div className='video-play-btn'>
        <div className='video-play-btn-icon' />
    </div>
    </div>);
  }
  else if (isAudio(attachment)) {
    return (<div className='media-attachment-audio'>
      <div className='heading'>
        <div className='name'>
          {message?.contact.displayName}
        </div>
        <Timestamp
          timestamp={message?.msg.timestamp * 1000}
          extended
          module='date'
        />
      </div>
      <audio controls>
        <source src={attachment.url} />
      </audio>
    </div>);
  }
  else {
    const { fileName, fileSize, contentType } = attachment;
    const extension = getExtension(attachment);
    return (<div className='media-attachment-generic' role='button' onClick={(ev) => {onDownload(message.msg)}}>
      <div className='file-icon' draggable='true' onClick={onClickAttachment} onDragStart={dragAttachmentOut.bind(null, attachment)} title={contentType}>
        {extension ? (<div className='file-extension'>
          {contentType === 'application/octet-stream' ? '' : extension}
        </div>) : null}
      </div>
      <div className='text-part'>
        <div className='name'>
          {fileName}
        </div>
        <div className='size'>
          {fileSize}
        </div>
      </div>
    </div>);
  }
}
