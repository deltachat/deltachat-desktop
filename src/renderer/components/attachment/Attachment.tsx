const { ipcRenderer } = window.electron_functions
import mimeTypes from 'mime-types'

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
  'image/vnd.microsoft.icon', 'image/ico', 'image/icon', 'image/x-icon',
  // PNG
  'image/apng', 'image/png'
])
// See: https://www.chromium.org/audio-video
const SUPPORTED_VIDEO_MIME_TYPES = Object.freeze([
  'video/mp4',
  'video/ogg',
  'video/webm'
])
/* EndSection - Data Copied in part from Signal */

// TODO define this correctly 
// (maybe inside shared module??, but that depends on wether its also used in the backend or just exists in the frontend)
export type attachment = { [key: string]: any, contentType: string, fileName: string, url: any }

export function isImage(attachment: attachment) {
  return (
    attachment &&
    attachment.contentType &&
    SUPPORTED_IMAGE_MIME_TYPES.includes(attachment.contentType)
  )
}

export function hasImage(attachment: attachment) {
  return attachment && attachment.url
}

export function isVideo(attachment: attachment) {
  return (
    attachment &&
    attachment.contentType &&
    SUPPORTED_VIDEO_MIME_TYPES.includes(attachment.contentType)
  )
}

export function hasVideoScreenshot(attachment: attachment) {
  return attachment && attachment.screenshot && attachment.screenshot.url
}

export function isAudio(attachment: attachment) {
  return (
    attachment && attachment.contentType && attachment.contentType.startsWith('audio/')
  )
}

export function isDisplayableByFullscreenMedia(attachment: attachment) {
  return isImage(attachment) || isAudio(attachment) || isVideo(attachment)
}

export function getExtension({ fileName, contentType }: attachment) {
  if (fileName && fileName.indexOf('.') >= 0) {
    const lastPeriod = fileName.lastIndexOf('.')
    const extension = fileName.slice(lastPeriod + 1)
    if (extension.length) {
      return extension
    }
  }

  return mimeTypes.extension(contentType) || null
}

export function dragAttachmentOut({ url }: attachment, dragEvent: DragEvent) {
  dragEvent.preventDefault()
  ipcRenderer.send('ondragstart', url)
}

