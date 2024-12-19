import React from 'react'
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
const SHOW_MAX_DIFFERENT_EMOJIS = 5

type Props = {
  reactions: T.Reactions
  tabindexForInteractiveContents: -1 | 0
}

export default function Reactions(props: Props) {
  const tx = useTranslationFunction()

  const { openDialog } = useDialog()
  const { reactionsByContact, reactions } = props.reactions

  const handleClick = () => {
    openDialog(ReactionsDialog, {
      reactionsByContact,
    })
  }

  return (
    <div className={styles.reactions}>
      {reactions
        .slice(0, SHOW_MAX_DIFFERENT_EMOJIS)
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
      {reactions.length > SHOW_MAX_DIFFERENT_EMOJIS && (
        <span className={classNames(styles.emoji, styles.showMore)} />
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
