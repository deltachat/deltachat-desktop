import React, { useState } from 'react'
import classNames from 'classnames'

import Icon from '../Icon'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import EmojiPicker from '../EmojiPicker'

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
    <>
      {showAllEmojis && (
        <EmojiPicker
          onSelect={(emoji: BaseEmoji) => toggleReaction(emoji.native)}
        />
      )}
      {!showAllEmojis && (
        <div className={styles.reactionsBar}>
          {myReaction && !isMyReactionDefault && (
            <button
              onClick={() => toggleReaction(myReaction!)}
              className={classNames(
                styles.reactionsBarButton,
                styles.isFromSelf
              )}
            >
              <span className={styles.reactionsBarEmoji}>{myReaction}</span>
            </button>
          )}
          {DEFAULT_EMOJIS.map((emoji, index) => {
            return (
              <button
                key={`emoji-${index}`}
                onClick={() => toggleReaction(emoji)}
                className={classNames(styles.reactionsBarButton, {
                  [styles.isFromSelf]: myReaction === emoji,
                })}
              >
                <span className={styles.reactionsBarEmoji}>{emoji}</span>
              </button>
            )
          })}
          {(!myReaction || isMyReactionDefault) && (
            <button
              className={classNames(
                styles.reactionsBarButton,
                styles.showAllEmojis
              )}
              onClick={handleShowAllEmojis}
            >
              <Icon className={styles.showAllIcon} icon='more' />
            </button>
          )}
        </div>
      )}
    </>
  )
}
