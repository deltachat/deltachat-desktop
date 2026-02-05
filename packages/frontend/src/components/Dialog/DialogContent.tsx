import React from 'react'
import classNames from 'classnames'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  className?: string
}>

export default function DialogContent({ children, className }: Props) {
  return (
    <div className={classNames(styles.dialogContent, className)}>
      {children}
    </div>
  )
}
