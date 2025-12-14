import React from 'react'
import classNames from 'classnames'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  align?: 'spaceBetween' | 'start' | 'end' | 'center'
}>

export default function FooterActions({ children, align = 'end' }: Props) {
  return (
    <div className={classNames(styles.footerActions, styles[align])}>
      {children}
    </div>
  )
}
