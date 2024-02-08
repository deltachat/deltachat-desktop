import React from 'react'
import useTranslationFunction from '../../../hooks/useTranslationFunction'

import styles from './styles.module.scss'

export function NoAccountSelectedScreen() {
  const tx = useTranslationFunction()

  return (
    <div className={styles.NoAccountSelectedScreen}>
      <div className={styles.Background}>
        <div className={styles.InfoBox}>{tx('no_account_selected')}</div>
      </div>
    </div>
  )
}
