import React, { useState, useEffect, useCallback } from 'react'
import useTranslationFunction from '../../../hooks/useTranslationFunction'
import Icon from '../../Icon'

import styles from './GroupSearchInput.module.scss'

type Props = {
  onChange: (value: string) => void
  value: string
  id: string
  inputRef?: React.ClassAttributes<HTMLInputElement>['ref']
  onClear?: () => void
}

export default function GroupSearchInput(props: Props) {
  const tx = useTranslationFunction()
  const { onChange, value, id, onClear } = props
  const [debouncedValue, setDebouncedValue] = useState(value)

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
        ref={props.inputRef}
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
    </div>
  )
}
