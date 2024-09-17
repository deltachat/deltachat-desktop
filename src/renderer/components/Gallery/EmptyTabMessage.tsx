import React from 'react'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { MediaTabKey } from './types'

export default function EmptyTabMessage({ tab }: { tab: MediaTabKey }) {
  const tx = useTranslationFunction()
  let message: string
  switch (tab) {
    case 'images':
      message = tx('tab_image_empty_hint')
    case 'video':
      message = tx('tab_video_empty_hint')
    case 'audio':
      message = tx('tab_audio_empty_hint')
    case 'apps':
      message = tx('tab_webxdc_empty_hint')
    case 'files':
    default:
      message = tx('tab_docs_empty_hint')
  }
  return (
    <div className='empty-screen'>
      {/* IDEA: when we have someone doing illustrations this would be a great place to add some */}
      <p className='no-media-message'>{message}</p>
    </div>
  )
}
