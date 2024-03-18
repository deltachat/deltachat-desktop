import React from 'react'

import useOpenLinkSafely from '../../hooks/useOpenLinkSafely'

import type { PropsWithChildren } from 'react'

export default function ClickableLink({
  href,
  children,
}: PropsWithChildren<{ href: string }>) {
  const openLinkSafely = useOpenLinkSafely()

  const onClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault()
    openLinkSafely(href)
  }

  return (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  )
}
