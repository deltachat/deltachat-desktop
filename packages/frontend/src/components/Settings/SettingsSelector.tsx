import React from 'react'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'
import classNames from 'classnames'

type Props = PropsWithChildren<{
  onClick: () => void
  currentValue?: string
  description?: string
}>

export default function SettingsSelector(props: Props) {
  const { onClick, currentValue, children, description } = props

  return (
    // TODO a11y: this component implements `<select>` functionality,
    // but there are no `aria` attributes that make it clear.
    <button
      type='button'
      className={classNames(styles.settingsRow, styles.settingsSelector)}
      onClick={onClick}
    >
      <div className={styles.settingsRowLeft}>
        <div className={styles.settingsRowLabel}>{children}</div>
        {description && (
          <div className={styles.settingsRowDescription}>{description}</div>
        )}
      </div>
      {currentValue && (
        <div className={styles.settingsSelectorValue}>{currentValue}</div>
      )}
    </button>
  )
}
