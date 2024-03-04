import React from 'react'

import Button from '../Button'

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
    <Button
      className={styles.footerActionButton}
      onClick={onClick}
      type={danger ? 'danger' : undefined}
      disabled={disabled}
    >
      {children}
    </Button>
  )
}
