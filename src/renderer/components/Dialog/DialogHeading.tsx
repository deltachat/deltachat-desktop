import React from 'react'

import styles from './styles.module.scss'

import type { PropsOnlyChildren } from '../../types'

export default function DialogHeading({ children }: PropsOnlyChildren) {
  return <h4 className={styles.dialogHeading}>{children}</h4>
}
