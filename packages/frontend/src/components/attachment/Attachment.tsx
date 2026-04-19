import mimeTypes from 'mime-types'
import { Type } from '../../backend-com'
import { runtime } from '@deltachat-desktop/runtime-interface'

export function isImage(viewType: Type.Viewtype | null) {
  return viewType === 'Image' || viewType === 'Gif'
}

export function hasAttachment(attachment: MessageTypeAttachmentSubset | null) {
  return attachment && attachment.file
}

// note that we rely on the viewTypes from core here to make sure all Deltachat clients
// display the same attachment types in the same way - although this could result in not
// showing some attachments even if we could show them (like svg for example)
// see guess_msgtype_from_path_suffix in https://github.com/chatmail/core/blob/main/src/message.rs
const MEDIA_VIEW_TYPES = ['Image', 'Gif', 'Video', 'Audio', 'Voice'] as const

export function isDisplayableByFullscreenMedia(viewType: Type.Viewtype | null) {
  return MEDIA_VIEW_TYPES.includes(
    viewType as (typeof MEDIA_VIEW_TYPES)[number]
  )
}

export function isGenericAttachment(viewType: Type.Viewtype | null) {
  return !MEDIA_VIEW_TYPES.includes(
    viewType as (typeof MEDIA_VIEW_TYPES)[number]
  )
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
  file: MessageTypeAttachmentSubset['file'] & string,
  fileName: string | null,
  dragEvent: React.DragEvent<HTMLElement>
) {
  dragEvent.preventDefault()

  if (file) runtime.onDragFileOut(file, fileName)
}

export type MessageTypeAttachmentSubset = Pick<
  Type.Message,
  'id' | 'file' | 'fileMime' | 'fileBytes' | 'fileName' | 'viewType'
>
