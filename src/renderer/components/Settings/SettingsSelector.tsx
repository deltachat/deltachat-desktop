import React from 'react'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  onClick: () => void
  currentValue?: string
}>

export default function SettingsSelector(props: Props) {
  const { onClick, currentValue, children } = props

  return (
    <div className={styles.settingsSelector} onClick={onClick}>
      <div className={styles.settingsSelectorLabel}>{children}</div>
      {currentValue && (
        <div className={styles.settingsSelectorValue}>{currentValue}</div>
      )}
    </div>
  )
}
