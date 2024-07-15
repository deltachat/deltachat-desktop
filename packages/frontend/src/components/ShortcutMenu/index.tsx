import React from 'react'
import classNames from 'classnames'

import { showReactionsUi, useReactionsBar } from '../ReactionsBar'
import Icon from '../Icon'

import styles from './styles.module.scss'

import type { T } from '@deltachat/jsonrpc-client'

type OnButtonClick = React.MouseEvent<HTMLButtonElement, MouseEvent>

type Props = {
  chat: T.FullChat
  direction: 'incoming' | 'outgoing'
  message: T.Message
  showContextMenu: (event: OnButtonClick) => Promise<void>
}

export default function ShortcutMenu(props: Props) {
  return (
    <div
      className={classNames(styles.shortcutMenu, {
        [styles.incoming]: props.direction === 'incoming',
        [styles.outgoing]: props.direction === 'outgoing',
      })}
    >
      {showReactionsUi(props.message, props.chat) && (
        <ReactButton
          messageId={props.message.id}
          reactions={props.message.reactions}
        />
      )}
      <ContextMenuButton onClick={props.showContextMenu} />
    </div>
  )
}

function ReactButton(props: {
  messageId: number
  reactions: T.Message['reactions']
}) {
  const { showReactionsBar } = useReactionsBar()

  const onClick = (event: OnButtonClick) => {
    // We don't want `OutsideClickHelper` to catch this event, causing
    // the reaction bar to directly hide again when switching to other
    // messages by clicking the "react" button
    event.stopPropagation()

    // Show reaction bar aligned centered with the "react" button
    const { x, y } = event.currentTarget.getBoundingClientRect()

    showReactionsBar({
      messageId: props.messageId,
      reactions: props.reactions,
      x,
      y,
    })
  }

  return (
    <button className={styles.shortcutMenuButton} onClick={onClick}>
      <Icon className={styles.shortcutMenuIcon} icon='reaction' />
    </button>
  )
}

function ContextMenuButton(props: { onClick: (event: OnButtonClick) => void }) {
  return (
    <button className={styles.shortcutMenuButton} onClick={props.onClick}>
      <Icon className={styles.shortcutMenuIcon} icon='more' />
    </button>
  )
}
