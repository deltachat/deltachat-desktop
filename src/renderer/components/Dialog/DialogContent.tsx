import React from 'react'
import classNames from 'classnames'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  className?: string
  paddingBottom?: boolean
  paddingTop?: boolean
}>

export default function DialogContent({
  children,
  className,
  paddingBottom = false,
  paddingTop = false,
}: Props) {
  return (
    <div
      className={classNames(styles.dialogContent, className, {
        [styles.paddingBottom]: paddingBottom,
        [styles.paddingTop]: paddingTop,
      })}
    >
      {children}
    </div>
  )
}
