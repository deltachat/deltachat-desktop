import React from 'react'
import classNames from 'classnames'
import { Classes } from '@blueprintjs/core'

import type { CSSProperties, PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  noFooter?: boolean
  style?: CSSProperties
  id?: string
}>

export default function DialogBody(props: Props) {
  const { noFooter, children, style, id } = props

  return (
    <div
      className={classNames(Classes.DIALOG_BODY, styles.dialogBody, {
        [styles.noFooter]: noFooter,
      })}
      style={style}
      id={id}
    >
      {children}
    </div>
  )
}
