import React from 'react'

import styles from './styles.module.scss'

import type { ReactNode } from 'react'

type Props = {
  children?: ReactNode
}

export default function Callout({ children }: Props) {
  return <div className={styles.callout}>{children}</div>
}
