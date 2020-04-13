import React from 'react'
import MessageMetaData from '../message/MessageMetaData'
import { JsonMessage } from '../../../../shared/shared-types'
import { mapCoreMsgStatus2String } from '../helpers/MapMsgStatus'

export default class PopupMessage extends React.Component<{
  username: string
  formattedDate: string
  message: JsonMessage
}> {
  render() {
    const { username, formattedDate, message } = this.props
    if (message) {
      return (
        <div className='map-popup'>
          <div>{message.text}</div>
          <MessageMetaData
            status={mapCoreMsgStatus2String(message.state)}
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
