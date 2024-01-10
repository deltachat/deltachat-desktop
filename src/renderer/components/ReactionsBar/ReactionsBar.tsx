import React from 'react'
import classNames from 'classnames'

import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

import styles from './styles.module.scss'

type Props = {
  messageId: number
  myReaction?: string
}

const DEFAULT_EMOJIS = ['👍', '👎', '❤️']

export default function ReactionsBar({ messageId, myReaction }: Props) {
  const accountId = selectedAccountId()

  const toggleReaction = async (emoji: string) => {
    if (emoji === myReaction) {
      await BackendRemote.rpc.sendReaction(accountId, messageId, [])
    } else {
      await BackendRemote.rpc.sendReaction(accountId, messageId, [emoji])
    }
  }

  return (
    <div className={styles.reactionsBar}>
      {DEFAULT_EMOJIS.map((emoji, index) => {
        return (
          <button
            key={`emoji-${index}`}
            onClick={() => toggleReaction(emoji)}
            className={classNames(styles.reactionsBarEmoji, {
              [styles.isFromSelf]: myReaction === emoji,
            })}
          >
            {emoji}
          </button>
        )
      })}
    </div>
  )
}
