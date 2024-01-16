import React from 'react'
import classNames from 'classnames'

import styles from './styles.module.scss'

import type { T } from '@deltachat/jsonrpc-client'

const SHOW_MAX_DIFFERENT_EMOJIS = 5

type Props = {
  reactions: T.Reactions | null
}

export default function Reactions({ reactions }: Props) {
  const emojis = reactions ? reactions.reactions : []

  return (
    <div className={styles.reactions}>
      {emojis
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
              {count > 1 && ` ${count}`}
            </span>
          )
        })}
      {emojis.length > SHOW_MAX_DIFFERENT_EMOJIS && (
        <span className={classNames(styles.emoji)}>...</span>
      )}
    </div>
  )
}
