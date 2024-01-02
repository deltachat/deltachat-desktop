import React from 'react'

import styles from './styles.module.scss'

import type { PropsOnlyChildren } from '../../types'

export default function DialogFooter({ children }: PropsOnlyChildren) {
  return <footer className={styles.dialogFooter}>{children}</footer>
}
