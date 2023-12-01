import React from 'react'
import { Classes } from '@blueprintjs/core'

export default function FooterActions({
  children,
  style,
}: {
  children: any
  style?: any
}) {
  return (
    <div
      style={{ justifyContent: 'flex-end', ...style }}
      className={Classes.DIALOG_FOOTER_ACTIONS}
    >
      {children}
    </div>
  )
}
