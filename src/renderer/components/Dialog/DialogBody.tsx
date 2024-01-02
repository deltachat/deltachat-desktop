import classNames from 'classnames'
import React from 'react'

import styles from './styles.module.scss'

import type { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
  className?: string
}>

export default function DialogBody({ children, className }: Props) {
  return (
    <main className={classNames(styles.dialogBody, className)}>{children}</main>
  )
}
