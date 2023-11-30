import React from 'react'

import styles from './styles.module.scss'

export default function SettingsSelector(props: any) {
  const { onClick, currentValue, children, ...otherProps } = props
  return (
    <div className={styles.settingsSelector} onClick={onClick}>
      <button {...otherProps}>{children}</button>
      <div className='CurrentValue'>{currentValue}</div>
    </div>
  )
}
