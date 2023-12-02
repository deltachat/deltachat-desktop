import React from 'react'
import classNames from 'classnames'

import type { MouseEventHandler, PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  onClick: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
  danger?: boolean
}>

export default function FooterActionButton({
  children,
  onClick,
  disabled = false,
  danger = false,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={classNames(styles.footerActionButton, {
        [styles.danger]: danger,
      })}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
