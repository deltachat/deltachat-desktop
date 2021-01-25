import React, { PropsWithChildren } from 'react'
import { runtime } from '../../runtime'

export default class ClickableLink extends React.Component<
  PropsWithChildren<{ href: string; onClick?: (ev: MouseEvent) => void }>
> {
  onClick(event: MouseEvent) {
    event.preventDefault()
    runtime.openLink(this.props.href)
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
