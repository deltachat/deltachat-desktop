import React from 'react'

import type { MouseEventHandler, PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  onClick: MouseEventHandler<HTMLButtonElement>
  disabled?: boolean
}>

export default function FooterActionButton({
  children,
  onClick,
  disabled = false,
}: Props) {
  return (
    <button
      onClick={onClick}
      className={styles.footerActionButton}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
