import React from 'react'

import useOpenLinkSafely from '../../hooks/useOpenLinkSafely'
import { selectedAccountId } from '../../ScreenController'

import type { PropsWithChildren } from 'react'

export default function ClickableLink({
  href,
  children,
}: PropsWithChildren<{ href: string }>) {
  const openLinkSafely = useOpenLinkSafely()
  const accountId = selectedAccountId()

  const onClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault()
    openLinkSafely(accountId, href)
  }

  return (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  )
}
