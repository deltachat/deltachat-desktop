import React from 'react'

import useOpenLinkSafely, {
  useOpenNonMailtoLinkSafely,
} from '../../hooks/useOpenLinkSafely'
import { selectedAccountId } from '../../ScreenController'

import type { PropsWithChildren } from 'react'

/**
 * Note: requires that an account is selected to be rendered.
 */
export function ClickableLink({
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

/**
 * Same as {@link ClickableLink}, but does not require that
 * an account is selected, but the user of this component guarantees
 * that `href` is not a `mailto:` link.
 */
export function ClickableNonMailtoLink({
  href,
  children,
}: PropsWithChildren<{ href: string }>) {
  const openNonMailtoLinkSafely = useOpenNonMailtoLinkSafely()

  const onClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault()
    openNonMailtoLinkSafely(href)
  }

  return (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  )
}
