import React from 'react'
import classNames from 'classnames'

import styles from './styles.module.scss'

import type { T } from '@deltachat/jsonrpc-client'

type Props = {
  reactions: T.Reactions | null
}

export default function Reactions({ reactions }: Props) {
  const emojis = reactions ? reactions.reactions : []

  return (
    <div className={styles.reactions}>
      {emojis.map(({ emoji, isFromSelf, count }) => {
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
    </div>
  )
}
