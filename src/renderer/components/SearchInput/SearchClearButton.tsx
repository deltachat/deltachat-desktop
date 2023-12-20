import React from 'react'
import classNames from 'classnames'

import Icon from '../Icon'

import styles from './styles.module.scss'

type Props = {
  onChange: (event: { target: { value: '' } }) => void
  value: string
  extraCleanAction?: () => void
}

export function SearchClearButton(props: Props) {
  const { onChange, extraCleanAction, value } = props

  const onClear = () => {
    onChange({ target: { value: '' } })
    extraCleanAction?.()
  }

  const isHidden = value === '' && !extraCleanAction

  return (
    <button
      aria-label='Clear'
      className={classNames(styles.searchClearButton, {
        [styles.hidden]: isHidden,
      })}
      onClick={onClear}
    >
      <Icon className={styles.searchClearButtonIcon} icon='cross' size={12} />
    </button>
  )
}
