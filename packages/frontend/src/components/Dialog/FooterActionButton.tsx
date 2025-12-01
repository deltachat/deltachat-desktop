import React from 'react'

import Button from '../Button'

import type { ButtonProps } from '../Button'

import styles from './styles.module.scss'

const FooterActionButton = ({ children, ...props }: ButtonProps) => {
  return (
    <Button className={styles.footerActionButton} {...props}>
      {children}
    </Button>
  )
}

export default FooterActionButton
