import React from 'react'
import classNames from 'classnames'
import { Classes } from '@blueprintjs/core'

import type { CSSProperties, PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  hide?: boolean
  style?: CSSProperties
}>

export default function DialogFooter({ children, hide, style }: Props) {
  if (typeof hide === 'undefined') {
    hide = typeof children === 'undefined'
  }

  return (
    <div
      style={{ display: hide ? 'none' : 'block', ...style }}
      className={classNames(
        Classes.DIALOG_FOOTER,
        'bp4-dialog-footer-border-top'
      )}
    >
      {children}
    </div>
  )
}
