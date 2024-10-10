import React from 'react'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { MediaTabKey } from './types'

export default function EmptyTabMessage({ tab }: { tab: MediaTabKey }) {
  const tx = useTranslationFunction()

  const getMessage = (tab: MediaTabKey) => {
    switch (tab) {
      case 'images':
        return tx('tab_image_empty_hint')
      case 'video':
        return tx('tab_video_empty_hint')
      case 'audio':
        return tx('tab_audio_empty_hint')
      case 'apps':
        return tx('tab_webxdc_empty_hint')
      case 'files':
      default:
        return tx('tab_docs_empty_hint')
    }
  }
  return (
    <div className='empty-screen'>
      {/* IDEA: when we have someone doing illustrations this would be a great place to add some */}
      <p className='no-media-message'>{getMessage(tab)}</p>
    </div>
  )
}
