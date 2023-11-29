import React from 'react'
import classNames from 'classnames'
import { Icon } from '@blueprintjs/core'

import styles from './styles.module.scss'

type Props = {
  onClick: () => void
  isHidden: boolean
}

export function SearchClearButton(props: Props) {
  const { isHidden, onClick } = props

  return (
    <button
      aria-label='Clear'
      className={classNames(styles.searchClearButton, {
        [styles.hidden]: isHidden,
      })}
      onClick={onClick}
    >
      <Icon icon='cross' size={16} />
    </button>
  )
}
