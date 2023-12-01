import React from 'react'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

export default function FooterActions({ children }: PropsWithChildren<{}>) {
  return <div className={styles.footerActions}>{children}</div>
}
