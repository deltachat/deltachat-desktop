import classNames from 'classnames'
import React from 'react'

import styles from './styles.module.scss'

import type { PropsWithChildren } from 'react'

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
