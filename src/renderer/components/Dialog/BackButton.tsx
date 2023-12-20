import React from 'react'

import HeaderButton from './HeaderButton'

import type { ButtonHTMLAttributes } from 'react'

import styles from './styles.module.scss'

export default function BackButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <HeaderButton
      aria-label='Back'
      icon='arrow-left'
      iconSize={24}
      className={styles.backButton}
      {...props}
    />
  )
}
