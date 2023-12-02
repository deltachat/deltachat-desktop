import React from 'react'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  onClick: () => void
}>

export default function SettingsButton({ children, onClick }: Props) {
  return (
    <button className={styles.settingsButton} onClick={onClick}>
      {children}
    </button>
  )
}
