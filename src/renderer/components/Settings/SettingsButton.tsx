import classNames from 'classnames'
import React from 'react'

import styles from './styles.module.scss'

import type { PropsWithChildren } from 'react'

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
      className={classNames(styles.settingsButton, {
        [styles.highlight]: highlight,
      })}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
