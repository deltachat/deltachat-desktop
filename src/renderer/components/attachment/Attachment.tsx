const { ipcRenderer } = window.electron_functions
import mimeTypes from 'mime-types'
import { MessageTypeAttachmentSubset } from '../../../shared/shared-types'
import { DraftObject } from '../composer/Composer'

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
  // for opening avatars
  'image/x',
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

export function isImage(filemime: string | null) {
  return SUPPORTED_IMAGE_MIME_TYPES.includes(filemime || '')
}

export function hasAttachment(attachment: MessageTypeAttachmentSubset | null) {
  return attachment && attachment.file
}

export function isVideo(filemime: string | null) {
  return SUPPORTED_VIDEO_MIME_TYPES.includes(filemime || '')
}

export function isAudio(filemime: DraftObject['file_mime']) {
  if (!filemime) return false
  return filemime.startsWith('audio/')
}

export function isDisplayableByFullscreenMedia(filemime: string | null) {
  return isImage(filemime) || isAudio(filemime) || isVideo(filemime)
}

export function isGenericAttachment(filemime: string | null) {
  return !(isImage(filemime) || isVideo(filemime) || isAudio(filemime))
}

export function getExtension({
  file_name,
  file_mime,
}: MessageTypeAttachmentSubset) {
  if (file_name && file_name.indexOf('.') >= 0) {
    const lastPeriod = file_name.lastIndexOf('.')
    const extension = file_name.slice(lastPeriod + 1)
    if (extension.length) {
      return extension
    }
  }

  return mimeTypes.extension(file_mime || '') || null
}

export function dragAttachmentOut(
  file: MessageTypeAttachmentSubset['file'],
  dragEvent: React.DragEvent<HTMLDivElement>
) {
  dragEvent.preventDefault()
  ipcRenderer.send('ondragstart', file)
}
