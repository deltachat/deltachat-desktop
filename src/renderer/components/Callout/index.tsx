import React from 'react'

import styles from './styles.module.scss'

import type { PropsOnlyChildren } from '../../types'

export default function Callout({ children }: PropsOnlyChildren) {
  return <div className={styles.callout}>{children}</div>
}
