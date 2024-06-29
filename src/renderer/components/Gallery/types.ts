import { GalleryAttachmentElementProps } from '../attachment/mediaAttachment'
import { Type } from '../../backend-com'

export type MediaTabKey = 'images' | 'video' | 'audio' | 'files' | 'webxdc_apps'

export type GalleryElement = (
  props: GalleryAttachmentElementProps & {
    openFullscreenMedia: (message: Type.Message) => void
  }
) => JSX.Element

export type MessageId = number
export type ChatId = number
