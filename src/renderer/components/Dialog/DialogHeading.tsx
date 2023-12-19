import React, { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

export default function DialogHeading({ children }: PropsWithChildren<{}>) {
  return <h4 className={styles.dialogHeading}>{children}</h4>
}
