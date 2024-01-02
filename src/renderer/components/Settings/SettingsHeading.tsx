import React from 'react'

import styles from './styles.module.scss'

import type { PropsOnlyChildren } from '../../types'

export default function SettingsHeading({ children }: PropsOnlyChildren) {
  return <h4 className={styles.settingsHeading}>{children}</h4>
}
