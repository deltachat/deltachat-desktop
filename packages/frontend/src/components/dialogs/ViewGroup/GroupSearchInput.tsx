import React, { useEffect, useRef } from 'react'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import Icon from '../../Icon'

import styles from './styles.module.scss'

type Props = {
  onChange: (value: string) => void
  value: string
  id: string
  /** called when the user closes the filter input */
  onCollapse: () => void
}

/**
 * Text input to filter the member list of the group profile dialog.
 *
 * The X button clears the input, or closes it if it is already empty.
 */
export default function GroupSearchInput(props: Props) {
  const tx = useTranslationFunction()
  const { onChange, value, id, onCollapse } = props
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const hasValue = value.length > 0

  return (
    <div className={styles.searchInputContainer}>
      <input
        id={id}
        placeholder={tx('search')}
        aria-label={tx('search')}
        onChange={event => onChange(event.target.value)}
        value={value}
        className={styles.searchInput}
        data-no-drag-region
        ref={inputRef}
        spellCheck={false}
      />
      <button
        type='button'
        aria-label={hasValue ? tx('clear_search') : tx('close')}
        className={styles.searchInputButton}
        data-no-drag-region
        onClick={() => {
          if (hasValue) {
            onChange('')
          } else {
            onCollapse()
          }
        }}
      >
        <Icon className={styles.searchInputButtonIcon} icon='cross' size={20} />
      </button>
    </div>
  )
}
