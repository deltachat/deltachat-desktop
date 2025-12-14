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
  className?: string
  dataTestid?: string
}

export default function SearchInputButton({
  icon,
  onClick,
  size = 20,
  className,
  ...props
}: Props) {
  return (
    <button
      type='button'
      aria-label={props['aria-label']}
      data-testid={props['dataTestid']}
      className={classNames(styles.searchInputButton, className)}
      data-no-drag-region
      onClick={onClick}
    >
      <Icon className={styles.searchInputButtonIcon} icon={icon} size={size} />
    </button>
  )
}
