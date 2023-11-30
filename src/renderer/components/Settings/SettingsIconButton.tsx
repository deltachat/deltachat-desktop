import React from 'react'

import styles from './styles.module.scss'

export default function SettingsIconButton(props: any) {
  const { onClick, iconName, children, isLink, ...otherProps } = props

  return (
    <div className={styles.settingsIconButton} onClick={onClick}>
      <div
        className={styles.icon}
        style={{
          WebkitMask:
            'url(../images/icons/' + iconName + '.svg) no-repeat center',
        }}
      ></div>
      <button {...otherProps}>{children}</button>
      {isLink && (
        <div
          className={styles.icon}
          style={{
            WebkitMask: 'url(../images/icons/open_in_new.svg) no-repeat center',
          }}
        ></div>
      )}
    </div>
  )
}
