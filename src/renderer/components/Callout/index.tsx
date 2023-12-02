import React from 'react'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

export default function Callout({ children }: PropsWithChildren<{}>) {
  return <div className={styles.callout}>{children}</div>
}
