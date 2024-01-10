import React, { useMemo } from 'react'
import classNames from 'classnames'
import { C, T } from '@deltachat/jsonrpc-client'

import { useReactionsBar } from '../ReactionsBar'

import styles from './styles.module.scss'

type Props = {
  visible: boolean
  message: T.Message
}

export default function ShortcutMenu(props: Props) {
  return (
    <div
      className={classNames(styles.shortcutMenu, {
        [styles.visible]: props.visible,
      })}
    >
      <ReactButton
        messageId={props.message.id}
        reactions={props.message.reactions}
      />
    </div>
  )
}

function ReactButton(props: {
  messageId: number
  reactions: T.Message['reactions']
}) {
  const { reactions, messageId } = props
  const { showReactionsBar } = useReactionsBar()

  const myReaction = useMemo(() => {
    if (
      reactions &&
      C.DC_CONTACT_ID_SELF in reactions.reactionsByContact &&
      reactions.reactionsByContact[C.DC_CONTACT_ID_SELF].length > 0
    ) {
      return reactions.reactionsByContact[C.DC_CONTACT_ID_SELF][0]
    }

    return undefined
  }, [reactions])

  const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // We don't want `OutsideClickHelper` to catch this event, causing
    // the reaction bar to directly hide again when switching to other
    // messages by clicking the "react" button
    event.stopPropagation()

    // Show reaction bar aligned centered with the "react" button
    const { x, y, width } = event.currentTarget.getBoundingClientRect()

    showReactionsBar({
      messageId,
      myReaction,
      x: x + width / 2,
      y,
    })
  }

  return <button onClick={onClick}>React</button>
}
