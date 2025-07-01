import mimeTypes from 'mime-types'
import { Type } from '../../backend-com'
import { runtime } from '@deltachat-desktop/runtime-interface'

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
/* EndSection - Data Copied in part from Signal */

// TODO define this correctly
// (maybe inside shared module??, but that depends on wether its also used in the backend or just exists in the frontend)

export function isImage(filemime: string | null) {
  return SUPPORTED_IMAGE_MIME_TYPES.includes(filemime || '')
}

export function hasAttachment(attachment: MessageTypeAttachmentSubset | null) {
  return attachment && attachment.file
}

function canMaybePlayType(el: HTMLMediaElement, filemime: string) {
  // https://html.spec.whatwg.org/multipage/media.html#dom-navigator-canplaytype-dev
  const canPlayType = el.canPlayType(filemime)
  switch (canPlayType) {
    case 'probably':
      return true
    // > Implementers are encouraged to return "maybe"
    // > unless the type can be confidently established
    // > as being supported or not.
    case 'maybe':
      return true
    case '':
      return false
  }
  const _assert: never = canPlayType
}

const dummyVideoEl = document.createElement('video')
/**
 * Note that this does not guarantee that we are able to play this video.
 */
export function isVideo(filemime: string | null): boolean {
  if (
    filemime == null ||
    // This is to make sure that, wherever this function is used,
    // displaying it as an audio is preferred instead.
    // Because `dummyVideoEl.canPlayType('audio/...')`
    // may return 'probably' or 'maybe'.
    // See `isAudio`.
    !filemime.startsWith('video/')
  ) {
    return false
  }
  return canMaybePlayType(dummyVideoEl, filemime)
}

const dummyAudioEl = document.createElement('audio')
/**
 * Note that this does not guarantee that we are able to play this audio.
 */
export function isAudio(filemime: string | null) {
  if (
    filemime == null ||
    // This is to make sure that, wherever this function is used,
    // displaying it as a video is preferred instead.
    // Because `dummyAudioEl.canPlayType('video/...')`
    // may return 'probably' or 'maybe'.
    // See `isVideo`.
    //
    // We should probably always check `isVideo` first everywhere instead.
    !filemime.startsWith('audio/')
  ) {
    return false
  }
  return canMaybePlayType(dummyAudioEl, filemime)
}

export function isDisplayableByFullscreenMedia(filemime: string | null) {
  return isImage(filemime) || isAudio(filemime) || isVideo(filemime)
}

export function isGenericAttachment(filemime: string | null) {
  return !(isImage(filemime) || isVideo(filemime) || isAudio(filemime))
}

export function getExtension({
  fileName,
  fileMime,
}: MessageTypeAttachmentSubset) {
  if (fileName && fileName.indexOf('.') >= 0) {
    const lastPeriod = fileName.lastIndexOf('.')
    const extension = fileName.slice(lastPeriod + 1)
    if (extension.length) {
      return extension
    }
  }

  return mimeTypes.extension(fileMime || '') || null
}

export function dragAttachmentOut(
  file: MessageTypeAttachmentSubset['file'],
  dragEvent: React.DragEvent<HTMLDivElement>
) {
  dragEvent.preventDefault()
  if (file) runtime.onDragFileOut(file)
}

export type MessageTypeAttachmentSubset = Pick<
  Type.Message,
  'id' | 'file' | 'fileMime' | 'fileBytes' | 'fileName' | 'webxdcInfo'
>
