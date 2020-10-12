const { ipcRenderer } = window.electron_functions
import mimeTypes from 'mime-types'
import { MessageTypeAttachment } from '../../../shared/shared-types'

/* Section - Data Copied in part from Signal */
// Supported media types in google chrome
// See: https://en.wikipedia.org/wiki/Comparison_of_web_browsers#Image_format_support
const SUPPORTED_IMAGE_MIME_TYPES = Object.freeze([
  'image/bmp',
  'image/gif',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp',
  'image/x-xbitmap',
  // ICO
  'image/vnd.microsoft.icon',
  'image/ico',
  'image/icon',
  'image/x-icon',
  // PNG
  'image/apng',
  'image/png',
])
// See: https://www.chromium.org/audio-video
const SUPPORTED_VIDEO_MIME_TYPES = Object.freeze([
  'video/mp4',
  'video/ogg',
  'video/webm',
])
/* EndSection - Data Copied in part from Signal */

// TODO define this correctly
// (maybe inside shared module??, but that depends on wether its also used in the backend or just exists in the frontend)

export function isImage(attachment: MessageTypeAttachment) {
  return (
    attachment &&
    attachment.contentType &&
    SUPPORTED_IMAGE_MIME_TYPES.includes(attachment.contentType)
  )
}

export function hasAttachment(attachment: MessageTypeAttachment) {
  return attachment && attachment.url
}

export function isVideo(attachment: MessageTypeAttachment) {
  return (
    attachment &&
    attachment.contentType &&
    SUPPORTED_VIDEO_MIME_TYPES.includes(attachment.contentType)
  )
}

export function isAudio(attachment: MessageTypeAttachment) {
  return (
    attachment &&
    attachment.contentType &&
    attachment.contentType.startsWith('audio/')
  )
}

export function isDisplayableByFullscreenMedia(
  attachment: MessageTypeAttachment
) {
  return isImage(attachment) || isAudio(attachment) || isVideo(attachment)
}

export function getExtension({ fileName, contentType }: MessageTypeAttachment) {
  if (fileName && fileName.indexOf('.') >= 0) {
    const lastPeriod = fileName.lastIndexOf('.')
    const extension = fileName.slice(lastPeriod + 1)
    if (extension.length) {
      return extension
    }
  }

  return mimeTypes.extension(contentType) || null
}

export function dragAttachmentOut(
  { url }: MessageTypeAttachment,
  dragEvent: DragEvent
) {
  dragEvent.preventDefault()
  ipcRenderer.send('ondragstart', url)
}

export function isGenericAttachment(attachment: MessageTypeAttachment) {
  return !(isImage(attachment) || isVideo(attachment) || isAudio(attachment))
}
