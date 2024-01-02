import React from 'react'

import styles from './styles.module.scss'

import type { ReactNode } from 'react'

type Props = {
  children?: ReactNode
}

export default function DialogFooter({ children }: Props) {
  return <footer className={styles.dialogFooter}>{children}</footer>
}
