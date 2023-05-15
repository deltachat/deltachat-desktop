import React from 'react'
import { C } from 'deltachat-node/node/dist/constants'
import { BackendRemote } from '../../backend-com'
import { T } from '@deltachat/jsonrpc-client'
import { selectedAccountId } from '../../ScreenController'

export function Reactions({
  reactions,
  messageId,
}: {
  reactions: T.Reactions
  messageId: number
}) {
  const emojis = reactions.reactions
  const own_emojis = reactions.reactionsByContact[C.DC_CONTACT_ID_SELF] || []

  // TODO: on hover show who reacted? maybe lazy loading onhover set title of show custom popover
  return (
    <div className='message-reactions'>
      {emojis.map(({ emoji, isFromSelf, count }) => {
        return (
          <span
            className={`reaction ${isFromSelf && 'own'}`}
            onClick={react.bind(null, messageId, own_emojis, emoji, isFromSelf)}
            key={emoji}
          >
            {emoji}
            {count > 1 ? ` ${count}` : ''}
          </span>
        )
      })}
    </div>
  )
}

async function react(
  messageId: number,
  own_emojis: string[],
  emoji: string,
  remove: boolean
) {
  // code for having multiple reactions per user
  // let emojis = [...own_emojis]
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
