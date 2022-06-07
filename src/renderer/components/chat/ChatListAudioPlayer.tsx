import React from 'react'
import { MessageType } from '../../../shared/shared-types'

export function ChatListAudioPlayer({ msg }: { msg: MessageType }) {
  return (
    <div className='audio-player'>
      <div className='control'>
        <div>⏪</div>
        <div>▶️</div>
        <div>⏩</div>
      </div>
      <div>Audio Message from Bob</div>
      <div className='info'>0:30</div>
      <div className='close'>X</div>
    </div>
  )
}
