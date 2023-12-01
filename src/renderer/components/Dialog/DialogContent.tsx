import React from 'react'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

export default function DialogContent({ children }: PropsWithChildren<{}>) {
  return <div className={styles.dialogContent}>{children}</div>
}
