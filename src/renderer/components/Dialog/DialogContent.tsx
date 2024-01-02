import classNames from 'classnames'
import React from 'react'

import styles from './styles.module.scss'

import type { PropsWithChildren } from 'react'

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
