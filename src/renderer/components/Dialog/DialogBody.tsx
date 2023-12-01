import React from 'react'
import classNames from 'classnames'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

export default function DialogBody({ children }: PropsWithChildren<{}>) {
  return <div className={classNames(styles.dialogBody)}>{children}</div>
}
