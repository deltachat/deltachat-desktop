import React, { PropsWithChildren } from 'react'

import styles from './styles.module.scss'

type Props = PropsWithChildren<{
  className?: string
}>

export function NavbarGroupLeft({ children }: Props) {
  return <div className={styles.navbarGroupLeft}>{children}</div>
}

export function NavbarGroupRight({ children }: Props) {
  return <div className={styles.navbarGroupRight}>{children}</div>
}

export function Navbar({ children }: Props) {
  return <div className={styles.navbar}>{children}</div>
}
