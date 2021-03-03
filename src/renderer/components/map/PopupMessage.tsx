import React from 'react'
import MessageMetaData from '../message/MessageMetaData'
import { Message } from '../../../shared/shared-types'

export default class PopupMessage extends React.Component<{
  username: string
  formattedDate: string
  message: Message
}> {
  render() {
    const { username, formattedDate, message } = this.props
    if (message) {
      return (
        <div className='map-popup'>
          <div>{message.text}</div>
          <MessageMetaData
            state={message.state}
            timestamp={message.timestamp * 1000}
            padlock={message.showPadlock}
            username={username}
          />
        </div>
      )
    } else {
      return (
        <div className='map-popup'>
          {' '}
          {username} <br /> {formattedDate}{' '}
        </div>
      )
    }
  }
}
