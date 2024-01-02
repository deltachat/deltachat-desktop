import React from 'react'

import { openLinkSafely } from './LinkConfirmation'
import useDialog from '../../hooks/useDialog'

import type { PropsWithChildren } from 'react'

export default function ClickableLink({
  href,
  children,
}: PropsWithChildren<{ href: string }>) {
  const { openDialog } = useDialog()

  const onClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault()
    openLinkSafely(openDialog, href)
  }

  return (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  )
}
