import Picker from '@emoji-mart/react'
import React, { useState } from 'react'
import classNames from 'classnames'
import emojiData from '@emoji-mart/data'

import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

import styles from './styles.module.scss'

import type { BaseEmoji } from 'emoji-mart/index'

type Props = {
  messageId: number
  myReaction?: string
}

const DEFAULT_EMOJIS = ['👍', '👎', '❤️', '😂', '🙁']

export default function ReactionsBar({ messageId, myReaction }: Props) {
  const [showAllEmojis, setShowAllEmojis] = useState(false)
  const accountId = selectedAccountId()

  const toggleReaction = async (emoji: string) => {
    if (emoji === myReaction) {
      await BackendRemote.rpc.sendReaction(accountId, messageId, [])
    } else {
      await BackendRemote.rpc.sendReaction(accountId, messageId, [emoji])
    }
  }

  const handleShowAllEmojis = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.stopPropagation()
    setShowAllEmojis(true)
  }

  const isMyReactionDefault = myReaction
    ? DEFAULT_EMOJIS.includes(myReaction)
    : false

  return (
    <div className={styles.reactionsBar}>
      {!showAllEmojis && (
        <>
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
          {(!myReaction || isMyReactionDefault) && (
            <button onClick={handleShowAllEmojis}>...</button>
          )}
        </>
      )}
      {myReaction && !isMyReactionDefault && (
        <button
          onClick={() => toggleReaction(myReaction!)}
          className={classNames(styles.reactionsBarEmoji, styles.isFromSelf)}
        >
          {myReaction}
        </button>
      )}
      {showAllEmojis && (
        <Picker
          autoFocus={true}
          data={emojiData}
          native
          navPosition={'bottom'}
          onEmojiSelect={(emoji: BaseEmoji) => toggleReaction(emoji.native)}
          previewPosition={'none'}
          searchPosition={'sticky'}
          skinTonePosition={'none'}
        />
      )}
    </div>
  )
}
