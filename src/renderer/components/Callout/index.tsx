import React from 'react'
import classNames from 'classnames'

import type { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = {
  className?: string
}

export default function Callout({
  children,
  className,
}: PropsWithChildren<Props>) {
  return <div className={classNames(styles.callout, className)}>{children}</div>
}
