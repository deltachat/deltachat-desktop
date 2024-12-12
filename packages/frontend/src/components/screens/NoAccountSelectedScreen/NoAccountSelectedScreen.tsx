import React from 'react'

import useTranslationFunction from '../../../hooks/useTranslationFunction'

import styles from './styles.module.scss'

export function NoAccountSelectedScreen() {
  const tx = useTranslationFunction()

  return (
    <div data-drag className={styles.noAccountSelectedScreen}>
      <div className={styles.background}>
        <div data-no-drag className={styles.infoBox}>
          {tx('no_account_selected')}
        </div>
      </div>
    </div>
  )
}
