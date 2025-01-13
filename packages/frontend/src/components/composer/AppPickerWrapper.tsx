import React, { useEffect } from 'react'
import { AppPicker, AppInfo } from '../AppPicker'
import { runtime } from '@deltachat-desktop/runtime-interface'
import { getLogger } from '../../../../shared/logger'

import styles from './styles.module.scss'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

const log = getLogger('renderer/components/composer/AppPickerWrapper')

type Props = {
  onAppSelected?: (app: AppInfo) => void
  apps: AppInfo[]
  setApps: (apps: AppInfo[]) => void
}

export const AppPickerWrapper = ({ onAppSelected, apps, setApps }: Props) => {
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await BackendRemote.rpc.getHttpResponse(
          selectedAccountId(),
          'https://apps.testrun.org/xdcget-lock.json'
        )
        const apps = await runtime.getJsonFromBase64(response.blob)
        if (apps) {
          setApps(apps)
        }
      } catch (error) {
        log.error('Failed to fetch apps:', error)
      }
    }
    if (!apps?.length) {
      fetchApps()
    }
  }, [apps, setApps])

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
