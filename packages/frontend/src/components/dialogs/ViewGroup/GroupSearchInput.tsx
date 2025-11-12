import React, { useState, useEffect, useCallback, useRef } from 'react'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import Icon from '../../Icon'

import styles from './styles.module.scss'

type Props = {
  onChange: (value: string) => void
  value: string
  id: string
  inputRef?: React.ClassAttributes<HTMLInputElement>['ref']
  onClear?: () => void
  onCollapse?: () => void
}

export default function GroupSearchInput(props: Props) {
  const tx = useTranslationFunction()
  const { onChange, value, id, onClear, onCollapse } = props
  const [debouncedValue, setDebouncedValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(debouncedValue)
    }, 300) // defer update delay

    return () => {
      clearTimeout(handler)
    }
  }, [debouncedValue, onChange])

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDebouncedValue(event.target.value)
    },
    []
  )

  const handleClear = useCallback(() => {
    setDebouncedValue('')
    onClear?.()
  }, [onClear])

  const handleCollapse = useCallback(() => {
    onCollapse?.()
  }, [onCollapse])

  const hasValue = value.length > 0

  return (
    <div className={styles.searchInputContainer}>
      <input
        id={id}
        placeholder={tx('search')}
        aria-label={tx('search')}
        aria-description={tx('search_explain')}
        onChange={handleChange}
        value={debouncedValue}
        className={styles.searchInput}
        data-no-drag-region
        ref={inputRef}
        spellCheck={false}
      />
      {hasValue && (
        <button
          aria-label={tx('clear_search')}
          className={styles.searchInputButton}
          data-no-drag-region
          onClick={handleClear}
        >
          <Icon
            className={styles.searchInputButtonIcon}
            icon='cross'
            size={20}
          />
        </button>
      )}
      {!hasValue && (
        <button
          aria-label={tx('close')}
          className={styles.searchInputButton}
          data-no-drag-region
          onClick={handleCollapse}
        >
          <Icon
            className={styles.searchInputButtonIcon}
            icon='cross'
            size={20}
          />
        </button>
      )}
    </div>
  )
}
