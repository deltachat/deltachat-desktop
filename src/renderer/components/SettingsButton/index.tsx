import React from 'react'

import styles from './styles.module.scss'

export default function SettingsButton(props: any) {
  const { onClick, children, ...otherProps } = props

  return (
    <div className={styles.settingsButton} onClick={onClick}>
      <button {...otherProps}>{children}</button>
    </div>
  )
}
