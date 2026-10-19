import React, { useMemo } from 'react'
import classNames from 'classnames'

import useDialog from '../../hooks/dialog/useDialog'
import ReactionsDialog from '../dialogs/ReactionsDialog'

import styles from './styles.module.scss'

import type { T } from '@deltachat/jsonrpc-client'
import useTranslationFunction from '../../hooks/useTranslationFunction'

// Reactions are sorted by their frequencies in the core, that is, the
// most used emojis come first in this list.

type Props = {
  message: Pick<T.Message, 'id' | 'reactions'> & {
    reactions: NonNullable<T.Message['reactions']>
  }
  chatType: T.FullChat['chatType']
  tabindexForInteractiveContents: -1 | 0
  messageWidth: number
}

export default function Reactions(props: Props) {
  const tx = useTranslationFunction()

  const { messageWidth, chatType } = props

  const { openDialog } = useDialog()
  const { reactions } = props.message.reactions

  // Compute visibleEmojis and hiddenReactionsCount from props
  const { visibleEmojis, hiddenReactionsCount } = useMemo(() => {
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
      return { visibleEmojis: emojiSpaces, hiddenReactionsCount: 0 }
    } else {
      return {
        visibleEmojis: emojiSpaces,
        hiddenReactionsCount: totalReactionsCount - visibleReactionsCount,
      }
    }
  }, [messageWidth, reactions])

  const handleClick = () => {
    openDialog(ReactionsDialog, {
      message: props.message,
      // In channels only the accumulated reactions are shown, not who reacted
      // with what. Subscribers don't know it anyway, and for the owner
      // the details would be of little use and clutter the UI.
      showContacts: chatType !== 'InBroadcast' && chatType !== 'OutBroadcast',
    })
  }

  return (
    <div className={styles.reactions}>
      {reactions.map(({ emoji, isFromSelf, count }, index) => {
        return (
          <span
            className={classNames(styles.emoji, {
              [styles.isFromSelf]: isFromSelf,
              // Instead of not rendering hidden reactions at all,
              // hide them with CSS,
              // so as to not trigger `aria-live` announcements on resize.
              'visually-hidden': index >= visibleEmojis,
            })}
            key={emoji}
          >
            {emoji}
            {count > 1 && <span className={styles.emojiCount}>{count}</span>}
          </span>
        )
      })}
      {reactions.length > visibleEmojis && (
        <span
          aria-hidden
          className={classNames(styles.emoji, styles.emojiCount)}
        >
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
