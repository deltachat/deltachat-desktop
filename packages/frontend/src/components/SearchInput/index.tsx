import React from 'react'

import { IconButton } from '../Icon'
import useTranslationFunction from '../../hooks/useTranslationFunction'
import { runtime } from '@deltachat-desktop/runtime-interface'

import styles from './styles.module.scss'

type Props = {
  onChange: (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: '' } }
  ) => void
  value: string
  id: string
  inputRef?: React.ClassAttributes<HTMLInputElement>['ref']
  /** If this is defined clear button is always shown, like with search in chat */
  onClear?: () => void
}

export default function SearchInput(props: Props) {
  const tx = useTranslationFunction()
  const { onChange, value, id, onClear } = props
  const searchShortcut = runtime.getRuntimeInfo().isMac ? 'Meta+F' : 'Control+F'

  const handleClear = () => {
    onChange({ target: { value: '' } })
    onClear?.()
  }

  const hasValue = value.length > 0 || onClear

  return (
    <div
      role='search'
      // `aria-label={tx('search')}` is not required,
      // a "search" landmark is enough.
      // Note that `_explain` strings are generally verbose
      // and are more suitable for `aria-description`,
      // but here it's fine to use it as the label.
      // We must speecify the label, because we have multiple searches
      // in the app, another one being the attachments search.
      aria-label={tx('search_explain')}
      className={styles.inputAndClearButton}
    >
      <input
        id={id}
        placeholder={tx('search')}
        autoFocus
        onChange={onChange}
        value={value}
        className={`${styles.searchInput} search-input`}
        data-no-drag-region
        // eslint-disable-next-line react-hooks/refs
        ref={props.inputRef}
        spellCheck={false}
        // FYI there is also Ctrl/Cmd + Shift + F to search in chat.
        aria-keyshortcuts={searchShortcut}
      />
      {hasValue && (
        <IconButton
          styling='highlight'
          noDragRegion
          aria-label={tx('clear_search')}
          icon='cross'
          onClick={handleClear}
        />
      )}
    </div>
  )
}
