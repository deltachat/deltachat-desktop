import React from 'react'
import classNames from 'classnames'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  className?: string
  allowTopPadding?: boolean
}>

export default function DialogContent({
  children,
  className,
  allowTopPadding,
}: Props) {
  return (
    <div
      className={classNames(
        styles.dialogContent,
        allowTopPadding && styles.allowTopPadding,
        className
      )}
    >
      {children}
    </div>
  )
}
