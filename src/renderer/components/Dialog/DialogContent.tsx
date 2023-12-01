import React from 'react'
import classNames from 'classnames'

import type { CSSProperties, PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  noPadding?: boolean
  noOverflow?: boolean
  className?: string
  style?: CSSProperties
  id?: string
}>

export default function DialogContent(props: Props) {
  const { noPadding, noOverflow, style, id, className } = props

  return (
    <div
      className={classNames(
        'delta-dialog-content',
        {
          'delta-dialog-content--no-padding': noPadding,
          'delta-dialog-content--no-overflow': noOverflow,
        },
        className
      )}
      style={style}
      id={id}
    >
      {props.children}
    </div>
  )
}
