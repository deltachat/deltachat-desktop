import React from 'react'
import classNames from 'classnames'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = {
  variant: 'welcome'
}

export default function ImageBackdrop({
  children,
  variant = 'welcome',
}: PropsWithChildren<Props>) {
  return (
    <div className={classNames(styles.imageBackdrop, styles[variant])}>
      {children}
    </div>
  )
}
