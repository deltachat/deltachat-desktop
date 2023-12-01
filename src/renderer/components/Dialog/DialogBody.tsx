import React from 'react'
import classNames from 'classnames'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  noPadding?: boolean
  noOverflow?: boolean
}>

export default function DialogBody({
  children,
  noPadding = false,
  noOverflow = false,
}: Props) {
  return (
    <main
      className={classNames(styles.dialogBody, {
        [styles.noPadding]: noPadding,
        [styles.noOverflow]: noOverflow,
      })}
    >
      {children}
    </main>
  )
}
