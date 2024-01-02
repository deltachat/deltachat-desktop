import React from 'react'

import styles from './styles.module.scss'

import type { ReactNode } from 'react'

type Props = {
  children?: ReactNode
}

export default function SettingsHeading({ children }: Props) {
  return <h4 className={styles.settingsHeading}>{children}</h4>
}
