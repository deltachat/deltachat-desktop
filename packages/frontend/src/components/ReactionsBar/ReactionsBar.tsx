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
import {
  RovingTabindexProvider,
  useRovingTabindex,
} from '../../contexts/RovingTabindex'

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
    // IDK why, but `focus()` doesn't work if it's the first time
    // that we open the reactions bar for a chat.
    setTimeout(() => {
      const firstButton =
        reactionsBarRef.current?.getElementsByTagName('button')[0]
      if (firstButton == undefined) {
        log.warn('Failed to focus reactions bar after opening it')
        return
      }
      firstButton.focus()
    })
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
          <RovingTabindexProvider
            wrapperElementRef={reactionsBarRef}
            direction='horizontal'
          >
            {DEFAULT_EMOJIS.map(emoji => {
              return (
                <ReactionButton
                  key={emoji}
                  emoji={emoji}
                  isChecked={myReaction === emoji}
                  onClick={() => toggleReaction(emoji)}
                />
              )
            })}

            {myReaction && !isMyReactionDefault && (
              <ReactionButton
                emoji={myReaction}
                isChecked={true}
                onClick={() => toggleReaction(myReaction)}
              />
            )}
            <MoreEmojisButton onClick={handleShowAllEmojis} />
          </RovingTabindexProvider>
        </div>
      )}
    </>
  )
}

function ReactionButton(props: {
  emoji: string
  isChecked: boolean
  onClick: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const rovingTabindex = useRovingTabindex(ref)

  return (
    <button
      ref={ref}
      type='button'
      role='menuitemradio'
      aria-checked={props.isChecked}
      onClick={props.onClick}
      className={classNames(
        styles.reactionsBarButton,
        rovingTabindex.className,
        {
          [styles.isFromSelf]: props.isChecked,
        }
      )}
      tabIndex={rovingTabindex.tabIndex}
      onKeyDown={rovingTabindex.onKeydown}
      onFocus={rovingTabindex.setAsActiveElement}
    >
      <span className={styles.reactionsBarEmoji}>{props.emoji}</span>
    </button>
  )
}
function MoreEmojisButton(props: {
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const tx = useTranslationFunction()
  const rovingTabindex = useRovingTabindex(ref)

  return (
    <button
      ref={ref}
      type='button'
      role='menuitem'
      aria-haspopup='dialog'
      aria-label={tx('react_more_emojis')}
      className={classNames(
        styles.reactionsBarButton,
        styles.showAllEmojis,
        rovingTabindex.className
      )}
      onClick={props.onClick}
      tabIndex={rovingTabindex.tabIndex}
      onKeyDown={rovingTabindex.onKeydown}
      onFocus={rovingTabindex.setAsActiveElement}
    >
      <Icon className={styles.showAllIcon} icon='more' />
    </button>
  )
}
