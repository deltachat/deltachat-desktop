import React, { PropsWithChildren } from 'react'
import { openLinkSafely } from './LinkConfirmation'

export default class ClickableLink extends React.Component<
  PropsWithChildren<{
    href: string
    onClick?: (ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void
  }>
> {
  onClick(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    event.preventDefault()
    openLinkSafely(this.props.href)
  }

  render() {
    const { href, onClick, children } = this.props
    return (
      <a href={href} onClick={onClick || this.onClick.bind(this)}>
        {children}
      </a>
    )
  }
}
