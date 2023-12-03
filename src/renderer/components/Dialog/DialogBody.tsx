import React from 'react'
import classNames from 'classnames'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  className?: string
}>

export default function DialogBody({ children, className }: Props) {
  return (
    <main className={classNames(styles.dialogBody, className)}>{children}</main>
  )
}
