import React, { ChangeEvent } from 'react'
import classNames from 'classnames'

import { useTranslationFunction } from '../../contexts'
import { SearchClearButton } from './'

import styles from './styles.module.scss'

import type { Ref } from 'react'

type Props = {
  id: string
  inputRef?: Ref<HTMLInputElement>
  onChange: (queryStr: string) => void
  value: string
}

export function SearchInput({ onChange, value, id, inputRef }: Props) {
  const tx = useTranslationFunction()
  const isEmpty = value.length === 0

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value)
  }

  const handleClear = () => {
    onChange('')
  }

  return (
    <>
      <input
        id={id}
        placeholder={tx('search')}
        autoFocus
        onChange={handleChange}
        value={value}
        className={classNames(styles.searchInput, {
          [styles.active]: !isEmpty,
        })}
        ref={inputRef}
        spellCheck={false}
      />
      <SearchClearButton onClick={handleClear} isHidden={isEmpty} />
    </>
  )
}
