import React from 'react'
import classNames from 'classnames'
import { C, T } from '@deltachat/jsonrpc-client'

import { useReactionsBar } from '../ReactionsBar'

import styles from './styles.module.scss'
import Icon from '../Icon'

type OnButtonClick = React.MouseEvent<HTMLButtonElement, MouseEvent>

type Props = {
  direction: 'incoming' | 'outgoing'
  message: T.Message
  showContextMenu: (event: OnButtonClick) => Promise<void>
  visible: boolean
}

export default function ShortcutMenu(props: Props) {
  return (
    <div
      className={classNames(styles.shortcutMenu, {
        [styles.incoming]: props.direction === 'incoming',
        [styles.outgoing]: props.direction === 'outgoing',
        [styles.visible]: props.visible,
      })}
    >
      {!props.message.isSetupmessage && (
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
  const myReaction = getMyReaction(props.reactions)

  const onClick = (event: OnButtonClick) => {
    // We don't want `OutsideClickHelper` to catch this event, causing
    // the reaction bar to directly hide again when switching to other
    // messages by clicking the "react" button
    event.stopPropagation()

    // Show reaction bar aligned centered with the "react" button
    const { x, y, width } = event.currentTarget.getBoundingClientRect()

    showReactionsBar({
      messageId: props.messageId,
      myReaction,
      x: Math.round(x + width / 2),
      y: Math.round(y),
    })
  }

  return (
    <button className={styles.shortcutMenuButton} onClick={onClick}>
      <Icon className={styles.shortcutMenuIcon} icon='favorite' />
    </button>
  )
}

function ContextMenuButton(props: { onClick: (event: OnButtonClick) => void }) {
  return (
    <button className={styles.shortcutMenuButton} onClick={props.onClick}>
      <Icon className={styles.shortcutMenuIcon} icon='open_in_new' />
    </button>
  )
}

function getMyReaction(reactions: T.Message['reactions']): string | undefined {
  if (
    reactions &&
    C.DC_CONTACT_ID_SELF in reactions.reactionsByContact &&
    reactions.reactionsByContact[C.DC_CONTACT_ID_SELF].length > 0
  ) {
    return reactions.reactionsByContact[C.DC_CONTACT_ID_SELF][0]
  }

  return undefined
}
