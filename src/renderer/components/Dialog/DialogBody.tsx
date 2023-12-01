import React from 'react'
import classNames from 'classnames'
import { Classes } from '@blueprintjs/core'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{}>

export default function DialogBody(props: Props) {
  const { children } = props

  return (
    <div className={classNames(Classes.DIALOG_BODY, styles.dialogBody)}>
      {children}
    </div>
  )
}
