import React from 'react'
import classNames from 'classnames'

import useDialog from '../../hooks/useDialog'
import ReactionsDialog from '../dialogs/ReactionsDialog'

import styles from './styles.module.scss'

import type { T } from '@deltachat/jsonrpc-client'

const SHOW_MAX_DIFFERENT_EMOJIS = 5

type Props = {
  reactions: T.Reactions
}

export default function Reactions(props: Props) {
  const { openDialog } = useDialog()
  const { reactionsByContact, reactions } = props.reactions

  const handleClick = () => {
    openDialog(ReactionsDialog, {
      reactionsByContact,
    })
  }

  return (
    <div className={styles.reactions} onClick={handleClick}>
      {reactions
        .slice(0, SHOW_MAX_DIFFERENT_EMOJIS)
        .map(({ emoji, isFromSelf, count }) => {
          return (
            <span
              className={classNames(styles.emoji, {
                [styles.isFromSelf]: isFromSelf,
              })}
              key={emoji}
            >
              {emoji}
              {count > 1 && <span className={styles.emojiCount}>{count}</span>}
            </span>
          )
        })}
      {reactions.length > SHOW_MAX_DIFFERENT_EMOJIS && (
        <span className={classNames(styles.emoji, styles.showMore)} />
      )}
    </div>
  )
}
