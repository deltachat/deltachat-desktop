import { ipcRenderer } from 'electron'
import mimeTypes from 'mime-types'

import { isImageTypeSupported, isVideoTypeSupported } from '../conversations'

// TODO define this correctly 
// (maybe inside shared module??, but that depends on wether its also used in the backend or just exists in the frontend)
export type attachment = { [key: string]: any, contentType: string, fileName: string, url: any }

export function isImage(attachment: attachment) {
  return (
    attachment &&
    attachment.contentType &&
    isImageTypeSupported(attachment.contentType)
  )
}

export function hasImage(attachment: attachment) {
  return attachment && attachment.url
}

export function isVideo(attachment: attachment) {
  return (
    attachment &&
    attachment.contentType &&
    isVideoTypeSupported(attachment.contentType)
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

