import React from 'react'
import classNames from 'classnames'
import { C } from 'deltachat-node/node/dist/constants'

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
  const ownEmojis = reactions.reactionsByContact[C.DC_CONTACT_ID_SELF] || []

  // TODO: on hover show who reacted? maybe lazy loading onhover set title of show custom popover
  return (
    <div className={styles.reactions}>
      {emojis.map(({ emoji, isFromSelf, count }) => {
        return (
          <span
            className={classNames(styles.emoji, {
              [styles.isFromSelf]: isFromSelf,
            })}
            onClick={react.bind(null, messageId, ownEmojis, emoji, isFromSelf)}
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

async function react(
  messageId: number,
  ownEmojis: string[],
  emoji: string,
  remove: boolean
) {
  // code for having multiple reactions per user
  // let emojis = [...ownEmojis]
  // if (remove) {
  //   emojis = emojis.filter(e => e !== emoji)
  // } else {
  //   emojis.push(emoji)
  // }
  // await BackendRemote.rpc.sendReaction(selectedAccountId(), messageId, emojis)

  if (remove) {
    await BackendRemote.rpc.sendReaction(selectedAccountId(), messageId, [])
  } else {
    await BackendRemote.rpc.sendReaction(selectedAccountId(), messageId, [
      emoji,
    ])
  }
}
