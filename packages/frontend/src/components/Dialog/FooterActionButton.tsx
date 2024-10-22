import React from 'react'

import Button from '../Button'

import type { ButtonProps } from '../Button'

import styles from './styles.module.scss'

export default function FooterActionButton({
  children,
  ...props
}: ButtonProps) {
  return (
    <Button className={styles.footerActionButton} {...props}>
      {children}
    </Button>
  )
}
