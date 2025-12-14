import React from 'react'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

export default function DialogFooter({ children }: PropsWithChildren<{}>) {
  return <footer className={styles.dialogFooter}>{children}</footer>
}
