import React from 'react'
import classNames from 'classnames'
import { Classes } from '@blueprintjs/core'

import type { CSSProperties, PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  noFooter?: boolean
  ref?: todo
  style?: CSSProperties
  id?: string
}>

export default function DialogBody(props: Props) {
  const { noFooter, children, style, id } = props

  return (
    <div
      ref={props.ref}
      className={classNames(Classes.DIALOG_BODY, {
        'bp4-dialog-body-no-footer': noFooter !== false,
      })}
      style={style}
      id={id}
    >
      {children}
    </div>
  )
}
