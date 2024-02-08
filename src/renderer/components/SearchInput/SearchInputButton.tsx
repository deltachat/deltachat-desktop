import React from 'react'

import Icon from '../Icon'

import styles from './styles.module.scss'

import type { IconName } from '../Icon'

type Props = {
  icon: IconName
  onClick: () => void
  size?: number
}

export default function SearchInputButton({ icon, onClick, size = 20 }: Props) {
  return (
    <button className={styles.searchInputButton} onClick={onClick}>
      <Icon className={styles.searchInputButtonIcon} icon={icon} size={size} />
    </button>
  )
}
