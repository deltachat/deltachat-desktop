import React from 'react'

import useTranslationFunction from '../../../hooks/useTranslationFunction'

import styles from './styles.module.scss'

export function NoAccountSelectedScreen() {
  const tx = useTranslationFunction()

  return (
    <div data-tauri-drag-region className={styles.noAccountSelectedScreen}>
      <div data-tauri-drag-region className={styles.background}>
        <div data-no-drag-region className={styles.infoBox}>
          {tx('no_account_selected')}
        </div>
      </div>
    </div>
  )
}
