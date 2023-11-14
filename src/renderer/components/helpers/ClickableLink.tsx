import React, { PropsWithChildren } from 'react'

import { useDialog } from '../../hooks/useDialog'
import { openLinkSafely } from './LinkConfirmation'

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
