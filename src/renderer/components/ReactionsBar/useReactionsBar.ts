import { useContext } from 'react'
import { C } from '@deltachat/jsonrpc-client'

import { ReactionsBarContext } from '.'

import type { ShowReactionBar } from './ReactionsBarContext'
import type { T } from '@deltachat/jsonrpc-client'

export default function useReactionsBar() {
  const context = useContext(ReactionsBarContext)

  if (!context) {
    throw new Error(
      'useReactionsBar has to be used within <ReactionsBarProvider>'
    )
  }

  return {
    ...context,
    showReactionsBar: (
      args: Pick<ShowReactionBar, 'messageId' | 'x' | 'y'> & {
        reactions: T.Message['reactions']
      }
    ) => {
      const { reactions, ...remainingArgs } = args

      context.showReactionsBar({
        ...remainingArgs,
        myReaction: getMyReaction(reactions),
      })
    },
  }
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
