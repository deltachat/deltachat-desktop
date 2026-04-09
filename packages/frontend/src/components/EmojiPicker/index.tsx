import React, { useEffect, useRef } from 'react'
import classNames from 'classnames'
import emojiData from '@emoji-mart/data'
import { EmojiPicker as Picker } from '@emoji-mart-awesome/react'

import useTranslationFunction from '../../hooks/useTranslationFunction'
import { useThemeCssVar } from '../../ThemeManager'

import styles from './styles.module.scss'

export type EmojiMartData = {
  id: string
  name: string
  native: string
  unified: string
  shortcodes: string
  skin?: number
  keywords?: string[]
  aliases?: string[]
  emoticons?: string[]
}

type Props = {
  role: 'tabpanel' | undefined
  id: string | undefined
  labelledBy: string | undefined
  className?: string
  onSelect: (emoji: EmojiMartData) => void
  full?: boolean
}

export default function EmojiPicker({
  role,
  id,
  labelledBy,
  className,
  onSelect,
  full = false,
}: Props) {
  const tx = useTranslationFunction()

  let iconsTheme = useThemeCssVar('--SPECIAL-emoji-picker-category-icon-style')
  if (iconsTheme !== 'solid' && iconsTheme !== 'outline') {
    iconsTheme = 'solid'
  }

  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const picker = wrapperRef.current?.querySelector('em-emoji-picker')
    const shadowRoot = picker?.shadowRoot
    if (!shadowRoot) return
    const style = document.createElement('style')
    style.textContent = '.category > .sticky { background: none !important; }'
    shadowRoot.appendChild(style)
    return () => {
      shadowRoot.removeChild(style)
    }
  }, [])

  return (
    <div
      role={role}
      id={id}
      aria-labelledby={labelledBy}
      ref={wrapperRef}
      className={classNames(styles.emojiPicker, className, {
        [styles.full]: full,
      })}
    >
      <Picker
        data={emojiData}
        i18n={{
          search: tx('search'),
          notfound: tx('emoji_not_found'),
          categories: {
            search: tx('emoji_search_results'),
            recent: tx('emoji_recent'),
            people: tx('emoji_people'),
            nature: tx('emoji_nature'),
            foods: tx('emoji_foods'),
            activity: tx('emoji_activity'),
            places: tx('emoji_places'),
            objects: tx('emoji_objects'),
            symbols: tx('emoji_symbols'),
            flags: tx('emoji_flags'),
          },
        }}
        native
        onEmojiSelect={onSelect}
        navPosition='bottom'
        previewPosition='none'
        searchPosition='sticky'
        skinTonePosition='none'
        autoFocus
        dynamicWidth={full}
        icons={iconsTheme}
      />
    </div>
  )
}
