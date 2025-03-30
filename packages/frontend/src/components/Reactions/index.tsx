import React, { useEffect, useState } from 'react'
import classNames from 'classnames'

import useDialog from '../../hooks/dialog/useDialog'
import ReactionsDialog from '../dialogs/ReactionsDialog'

import styles from './styles.module.scss'

import type { T } from '@deltachat/jsonrpc-client'
import useTranslationFunction from '../../hooks/useTranslationFunction'

// With this constant we define how many max. different emojis we display
// under each message.
//
// Reactions are sorted by their frequencies in the core, that is, the
// most used emojis come first in this list.

type Props = {
  reactions: T.Reactions
  tabindexForInteractiveContents: -1 | 0
  messageWidth: number
}

export default function Reactions(props: Props) {
  const tx = useTranslationFunction()
  const [numberOfReactions, setNumberOfReactions] = useState(4)

  const { messageWidth } = props

  const { openDialog } = useDialog()
  const { reactionsByContact, reactions } = props.reactions

  useEffect(() => {
    if (messageWidth <= 200) {
      if (reactions.length <= 2) {
        setNumberOfReactions(2)
      } else {
        // we need space for the bubble showing +n
        setNumberOfReactions(1)
      }
    } else {
      const r = Math.round((messageWidth - 200) / 34)
      setNumberOfReactions(r)
    }
  }, [messageWidth, reactions])

  const handleClick = () => {
    openDialog(ReactionsDialog, {
      reactionsByContact,
    })
  }

  return (
    <div className={styles.reactions}>
      {reactions
        .slice(0, numberOfReactions)
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
      {reactions.length > numberOfReactions && (
        <span className={classNames(styles.emoji)}>
          +{reactions.length - numberOfReactions}
        </span>
      )}
      <button
        className={styles.openReactionsListDialogButton}
        aria-label={tx('more_info_desktop')}
        onClick={handleClick}
        tabIndex={props.tabindexForInteractiveContents}
      ></button>
    </div>
  )
}
