import React from 'react'
import classNames from 'classnames'
import { Icon } from '@blueprintjs/core'

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
      <Icon icon='cross' size={16} />
    </button>
  )
}
