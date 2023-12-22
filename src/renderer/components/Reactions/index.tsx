import React, { useCallback } from 'react'
import classNames from 'classnames'

import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

import type { T } from '@deltachat/jsonrpc-client'

import styles from './styles.module.scss'

type Props = {
  reactions: T.Reactions
  messageId: number
}

export default function Reactions({ reactions, messageId }: Props) {
  const emojis = reactions.reactions

  const sendReaction = useCallback(
    async (emoji: string, remove: boolean) => {
      if (remove) {
        await BackendRemote.rpc.sendReaction(selectedAccountId(), messageId, [])
      } else {
        await BackendRemote.rpc.sendReaction(selectedAccountId(), messageId, [
          emoji,
        ])
      }
    },
    [messageId]
  )

  // @TODO: Show a list of who reacted? Maybe lazy loading onhover set title of show custom popover
  return (
    <div className={styles.reactions}>
      {emojis.map(({ emoji, isFromSelf, count }) => {
        return (
          <span
            className={classNames(styles.emoji, {
              [styles.isFromSelf]: isFromSelf,
            })}
            onClick={() => sendReaction(emoji, isFromSelf)}
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
