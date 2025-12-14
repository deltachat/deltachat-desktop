import React from 'react'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

export default function SettingsHeading({ children }: PropsWithChildren<{}>) {
  return <h4 className={styles.settingsHeading}>{children}</h4>
}
