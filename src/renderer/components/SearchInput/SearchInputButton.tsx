import React from 'react'

import Icon from '../Icon'

import styles from './styles.module.scss'

import type { IconName } from '../Icon'
import classNames from 'classnames'

type Props = {
  'aria-label'?: string
  icon: IconName
  onClick: () => void
  size?: number
}

export default function SearchInputButton({
  icon,
  onClick,
  size = 20,
  ...props
}: Props) {
  return (
    <button
      aria-label={props['aria-label']}
      className={classNames(styles.searchInputButton, 'no-drag')}
      onClick={onClick}
    >
      <Icon className={styles.searchInputButtonIcon} icon={icon} size={size} />
    </button>
  )
}
