import React, { PropsWithChildren } from 'react'
const { openExternal } = window.electron_functions

export default class ClickableLink extends React.Component<
  PropsWithChildren<{ href: string; onClick?: (ev: MouseEvent) => void }>
> {
  onClick(event: MouseEvent) {
    event.preventDefault()
    openExternal(this.props.href)
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
