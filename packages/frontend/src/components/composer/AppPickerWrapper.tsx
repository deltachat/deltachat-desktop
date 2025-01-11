import React from 'react'
import { AppPicker, AppInfo } from '../AppPicker'
import apps from '../AppPicker/apps.json'

import styles from './styles.module.scss'

type Props = {
  onAppSelected?: (app: AppInfo) => void
}

export const AppPickerWrapper = ({ onAppSelected }: Props) => {
  return (
    <div className={styles.appPickerContainer}>
      <AppPicker
        className={styles.appPicker}
        apps={apps}
        onSelect={onAppSelected}
      ></AppPicker>
    </div>
  )
}
