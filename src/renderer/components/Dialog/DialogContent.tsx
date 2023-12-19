import React from 'react'
import classNames from 'classnames'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  paddingBottom?: boolean
  paddingTop?: boolean
}>

export default function DialogContent({
  children,
  paddingBottom = false,
  paddingTop = false,
}: Props) {
  return (
    <div
      className={classNames(styles.dialogContent, {
        [styles.paddingBottom]: paddingBottom,
        [styles.paddingTop]: paddingTop,
      })}
    >
      {children}
    </div>
  )
}
