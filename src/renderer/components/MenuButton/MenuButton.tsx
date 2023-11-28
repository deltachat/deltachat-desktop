import React from 'react'
import { Icon } from '@blueprintjs/core'

import { useTranslationFunction } from '../../contexts'

import styles from './styles.module.scss'

type Props = {
  onClick: () => void
}

export function MenuButton({ onClick }: Props) {
  const tx = useTranslationFunction()

  return (
    <div
      className={styles.menuButton}
      onClick={onClick}
      id='hamburger-menu-button'
    >
      <Icon icon='menu' aria-label={tx('main_menu')} size={20} />
    </div>
  )
}
