import React from 'react'
import classNames from 'classnames'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  onClick: () => void
  highlight?: boolean
}>

export default function SettingsButton({
  children,
  onClick,
  highlight = false,
}: Props) {
  return (
    <button
      tabIndex={0}
      className={classNames(styles.settingsButton, {
        [styles.highlight]: highlight,
      })}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
