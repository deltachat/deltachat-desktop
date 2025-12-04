import React, { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'

import Icon from '../Icon'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'
import EmojiPicker from '../EmojiPicker'

import styles from './styles.module.scss'

import type { BaseEmoji } from 'emoji-mart/index'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('ReactionsBar')

type Props = {
  messageId: number
  myReaction?: string
  onClick: () => void
}

const DEFAULT_EMOJIS = ['👍', '👎', '❤️', '😂', '🙁']

export default function ReactionsBar({
  onClick,
  messageId,
  myReaction,
}: Props) {
  const tx = useTranslationFunction()

  const reactionsBarRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const firstButton =
      reactionsBarRef.current?.getElementsByTagName('button')[0]
    if (firstButton == undefined) {
      log.warn('Failed to focus reactions bar after opening it')
      return
    }
    firstButton.focus()
  }, [])

  const [showAllEmojis, setShowAllEmojis] = useState(false)
  const accountId = selectedAccountId()

  const toggleReaction = async (emoji: string) => {
    if (emoji === myReaction) {
      await BackendRemote.rpc.sendReaction(accountId, messageId, [])
    } else {
      await BackendRemote.rpc.sendReaction(accountId, messageId, [emoji])
    }

    onClick()
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
          role={undefined}
          id={undefined}
          labelledBy={undefined}
          className={styles.reactionsBarPicker}
          onSelect={(emoji: BaseEmoji) => toggleReaction(emoji.native)}
        />
      )}
      {!showAllEmojis && (
        <div
          role='menu'
          aria-label={tx('react')}
          aria-orientation='horizontal'
          ref={reactionsBarRef}
          className={styles.reactionsBar}
        >
          {myReaction && !isMyReactionDefault && (
            <button
              type='button'
              role='menuitemradio'
              aria-checked={true}
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
            const isChecked = myReaction === emoji
            return (
              <button
                type='button'
                role='menuitemradio'
                aria-checked={isChecked}
                key={`emoji-${index}`}
                onClick={() => toggleReaction(emoji)}
                className={classNames(styles.reactionsBarButton, {
                  [styles.isFromSelf]: isChecked,
                })}
              >
                <span className={styles.reactionsBarEmoji}>{emoji}</span>
              </button>
            )
          })}
          <button
            type='button'
            role='menuitem'
            aria-haspopup='dialog'
            aria-label={tx('react_more_emojis')}
            className={classNames(
              styles.reactionsBarButton,
              styles.showAllEmojis
            )}
            onClick={handleShowAllEmojis}
          >
            <Icon className={styles.showAllIcon} icon='more' />
          </button>
        </div>
      )}
    </>
  )
}
