import React, { useEffect, useState } from 'react'
import classNames from 'classnames'

import useDialog from '../../hooks/dialog/useDialog'
import ReactionsDialog from '../dialogs/ReactionsDialog'

import styles from './styles.module.scss'

import type { T } from '@deltachat/jsonrpc-client'
import useTranslationFunction from '../../hooks/useTranslationFunction'

// Reactions are sorted by their frequencies in the core, that is, the
// most used emojis come first in this list.

type Props = {
  reactions: T.Reactions
  tabindexForInteractiveContents: -1 | 0
  messageWidth: number
}

export default function Reactions(props: Props) {
  const tx = useTranslationFunction()
  // number of different emojis we display under each message
  const [visibleEmojis, setVisibleEmojis] = useState(4)
  // total number of hidden reactions (including counts)
  const [hiddenReactionsCount, setHiddenReactionsCount] = useState(0)

  const { messageWidth } = props

  const { openDialog } = useDialog()
  const { reactionsByContact, reactions } = props.reactions

  useEffect(() => {
    let emojiSpaces = 0
    if (messageWidth <= 234) {
      emojiSpaces = 1
    } else {
      emojiSpaces = Math.round((messageWidth - 200) / 34)
    }
    const totalReactionsCount = reactions.reduce(
      (sum, item) => sum + item.count,
      0
    )
    const visibleReactionsCount = reactions
      .slice(0, emojiSpaces)
      .reduce((sum, item) => sum + item.count, 0)
    if (reactions.length - emojiSpaces <= 1) {
      emojiSpaces++
      setHiddenReactionsCount(0)
    } else {
      setHiddenReactionsCount(totalReactionsCount - visibleReactionsCount)
    }
    setVisibleEmojis(emojiSpaces)
  }, [messageWidth, reactions])

  const handleClick = () => {
    openDialog(ReactionsDialog, {
      reactionsByContact,
    })
  }

  return (
    <div className={styles.reactions}>
      {reactions.slice(0, visibleEmojis).map(({ emoji, isFromSelf, count }) => {
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
      {reactions.length > visibleEmojis && (
        <span className={classNames(styles.emoji, styles.emojiCount)}>
          +{hiddenReactionsCount}
        </span>
      )}
      <button
        type='button'
        className={styles.openReactionsListDialogButton}
        aria-label={tx('more_info_desktop')}
        onClick={handleClick}
        tabIndex={props.tabindexForInteractiveContents}
      ></button>
    </div>
  )
}
