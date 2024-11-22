import React from 'react'

import HeaderButton from './HeaderButton'

import type { ButtonHTMLAttributes } from 'react'

import styles from './styles.module.scss'
import useTranslationFunction from '../../hooks/useTranslationFunction'

export default function BackButton(
  props: ButtonHTMLAttributes<HTMLButtonElement>
) {
  const tx = useTranslationFunction()

  return (
    <HeaderButton
      value='cancel'
      formMethod='dialog'
      aria-label={tx('back')}
      icon='arrow-left'
      iconSize={24}
      className={styles.backButton}
      {...props}
    />
  )
}
