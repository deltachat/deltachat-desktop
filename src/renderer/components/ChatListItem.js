import React from 'react'
import classNames from 'classnames'
import styled from 'styled-components'
import { Timestamp, ContactName } from './conversations'
import MessageBody from './MessageBody'
import { renderAvatar } from './helpers/Contact'

const MessageText1 = styled.div`
  float: left;
  margin-right: 2px;
`
const MessageText1Draft = styled.div`
  float: left;
  margin-right: 2px;
  color: ${props => props.theme.draftTextColor}
`


export default class ChatListItem extends React.Component {
  renderUnread () {
    const { unreadCount } = this.props

    if (unreadCount > 0) {
      return (
        <div className='module-conversation-list-item__unread-count'>
          {unreadCount}
        </div>
      )
    }

    return null
  }

  renderVerified () {
    if (this.props.isVerified) {
      return (
        <img
          className='module-conversation-list-item__is-verified'
          src='../images/verified.png'
        />
      )
    }

    return null
  }

  renderGroupIcon () {
    if (this.props.isGroup) {
      return (
        <span
          className='module-conversation-list-item__is-group'
        />
      )
    }

    return null
  }

  renderHeader () {
    const {
      unreadCount,
      lastUpdated,
      name,
      email,
      profileName
    } = this.props

    return (
      <div className='module-conversation-list-item__header'>
        <div
          className={classNames(
            'module-conversation-list-item__header__name',
            unreadCount > 0
              ? 'module-conversation-list-item__header__name--with-unread'
              : null
          )}
        >
          {this.renderVerified()}
          {this.renderGroupIcon()}
          <ContactName
            email={email}
            name={name}
            profileName={profileName}
          />
        </div>
        <div
          className={classNames(
            'module-conversation-list-item__header__date',
            unreadCount > 0
              ? 'module-conversation-list-item__header__date--has-unread'
              : null
          )}
        >
          <Timestamp
            timestamp={lastUpdated}
            extended={false}
            module='module-conversation-list-item__header__timestamp'
          />
        </div>
      </div>
    )
  }

  renderMessage () {
    const tx = window.translate

    const { lastMessage, unreadCount } = this.props

    if (!lastMessage) {
      return null
    }

    const Text1 = lastMessage.status === 'draft' ? MessageText1Draft : MessageText1

    return (
      <div className='module-conversation-list-item__message'>
        <div
          className={classNames(
            'module-conversation-list-item__message__text',
            unreadCount > 0
              ? 'module-conversation-list-item__message__text--has-unread'
              : null
          )}
        >
          { lastMessage.text1 !== null
            ? <Text1>{lastMessage.text1 + ': ' }</Text1> : null
          }
          <MessageBody
            text={lastMessage.text2 || ''}
            disableJumbomoji
            preview
          />
        </div>
        {lastMessage.status ? (
          <div
            className={classNames(
              'status-icon',
              `status-icon--${
                lastMessage.status
              }`
            )}
            aria-label={tx(`a11y_delivery_status_${lastMessage.status}`)}
          />
        ) : null}
        {this.renderUnread()}
      </div>
    )
  }

  render () {
    const { unreadCount, onClick, isSelected, onContextMenu } = this.props
    const { avatarPath, color, name } = this.props
    return (
      <div
        role='button'
        onClick={onClick}
        onContextMenu={onContextMenu}
        className={classNames(
          'module-conversation-list-item',
          unreadCount > 0 ? 'module-conversation-list-item--has-unread' : null,
          isSelected ? 'module-conversation-list-item--is-selected' : null
        )}
      >
        {renderAvatar(avatarPath, color, name)}
        <div className='module-conversation-list-item__content'>
          {this.renderHeader()}
          {this.renderMessage()}
        </div>
      </div>
    )
  }
}

