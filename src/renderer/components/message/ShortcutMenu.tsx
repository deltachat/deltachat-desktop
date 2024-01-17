import React from 'react'
import classNames from 'classnames'
import { C, T } from '@deltachat/jsonrpc-client'

import { useReactionsBar } from '../ReactionsBar'

import styles from './styles.module.scss'

type OnButtonClick = React.MouseEvent<HTMLButtonElement, MouseEvent>

type Props = {
  visible: boolean
  message: T.Message
  showContextMenu: (event: OnButtonClick) => Promise<void>
}

export default function ShortcutMenu(props: Props) {
  return (
    <div
      className={classNames(styles.shortcutMenu, {
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

  return <button onClick={onClick}>:-)</button>
}

function ContextMenuButton(props: { onClick: (event: OnButtonClick) => void }) {
  return <button onClick={props.onClick}>...</button>
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
