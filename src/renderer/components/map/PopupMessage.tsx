import React from 'react'
import MessageMetaData from '../message/MessageMetaData'
import { mapCoreMsgStatus2String } from '../helpers/MapMsgStatus'
import MessageBody from '../message/MessageBody'
import { Type } from '../../backend-com'

export default class PopupMessage extends React.Component<{
  username: string
  formattedDate: string
  message: Type.Message | null
}> {
  render() {
    const { username, formattedDate, message } = this.props
    if (message) {
      return (
        <div className='map-popup'>
          <div>
            <MessageBody text={message.text || ''} />
          </div>
          <MessageMetaData
            status={mapCoreMsgStatus2String(message.state)}
            timestamp={message.timestamp * 1000}
            hasText={false}
            padlock={message.showPadlock}
            username={username}
            fileMime={null}
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
