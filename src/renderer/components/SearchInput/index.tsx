import React from 'react'
import classNames from 'classnames'

import { useTranslationFunction } from '../../contexts'
import { SearchClearButton } from './SearchClearButton'

import styles from './styles.module.scss'

type Props = {
  onChange: (
    event: React.ChangeEvent<HTMLInputElement> | { target: { value: '' } }
  ) => void
  value: string
  id: string
  inputRef?: React.ClassAttributes<HTMLInputElement>['ref']
  /** if this is defined clear button is always shown, like with search in chat */
  extraCleanAction?: () => void
}

export default function SearchInput(props: Props) {
  const { onChange, value, id, extraCleanAction } = props
  const tx = useTranslationFunction()

  return (
    <>
      <input
        id={id}
        placeholder={tx('search')}
        autoFocus
        onChange={onChange}
        value={value}
        className={classNames(styles.searchInput, {
          [styles.active]: value.length > 0,
        })}
        ref={props.inputRef}
        spellCheck={false}
      />
      <SearchClearButton
        value={value}
        onChange={onChange}
        extraCleanAction={extraCleanAction}
      />
    </>
  )
}
