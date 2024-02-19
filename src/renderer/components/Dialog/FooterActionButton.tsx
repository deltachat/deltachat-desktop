import React from 'react'

import Button from '../Button'

import type { MouseEventHandler, PropsWithChildren } from 'react'

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
      onClick={onClick}
      type={danger ? 'danger' : 'primary'}
      disabled={disabled}
    >
      {children}
    </Button>
  )
}
