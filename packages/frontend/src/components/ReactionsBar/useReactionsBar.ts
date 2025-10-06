import { useContext } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import { ReactionsBarContext } from '.'

import type { ShowReactionBar, ReactionsBarValue } from './ReactionsBarContext'
import type { T } from '@deltachat/jsonrpc-client'

type UseReactionsBar = Pick<
  ReactionsBarValue,
  'hideReactionsBar' | 'isReactionsBarShown'
> & {
  showReactionsBar: (
    args: Pick<ShowReactionBar, 'messageId' | 'x' | 'y'> & {
      reactions: T.Message['reactions']
    }
  ) => void
}

/** Move reactions bar slightly higher by x pixels */
const REACTIONS_BAR_Y_OFFSET = 10

export default function useReactionsBar(): UseReactionsBar {
  const context = useContext(ReactionsBarContext)

  if (!context) {
    throw new Error(
      'useReactionsBar has to be used within <ReactionsBarProvider>'
    )
  }

  return {
    ...context,
    showReactionsBar: args => {
      const { reactions, x, y, ...remainingArgs } = args

      context.showReactionsBar({
        ...remainingArgs,
        x: Math.round(x),
        y: Math.round(y) - REACTIONS_BAR_Y_OFFSET,
        myReaction: getMyReaction(reactions),
      })
    },
  }
}

/** Returns true if user should be able to send reactions to a message */
export function showReactionsUi(message: T.Message, chat: T.FullChat): boolean {
  return chat.canSend && !message.isInfo
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
