import React, { useEffect } from 'react'
import { AppPicker, AppInfo, AppStoreUrl } from '../AppPicker'
import { getLogger } from '../../../../shared/logger'

import styles from './styles.module.scss'
import { BackendRemote } from '../../backend-com'
import { selectedAccountId } from '../../ScreenController'

const log = getLogger('renderer/components/composer/AppPickerWrapper')

const getJsonFromBase64 = (base64: string): any => {
  try {
    const text = atob(base64)
    const length = text.length
    const bytes = new Uint8Array(length)
    for (let i = 0; i < length; i++) {
      bytes[i] = text.charCodeAt(i)
    }
    const decoder = new TextDecoder()
    return JSON.parse(decoder.decode(bytes))
  } catch (error) {
    log.critical('String could not de decoded or parsed')
    return null
  }
}

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
          AppStoreUrl + 'xdcget-lock.json'
        )
        const apps = getJsonFromBase64(response.blob)
        if (apps && Array.isArray(apps)) {
          apps.sort((a: AppInfo, b: AppInfo) => {
            const dateA = new Date(a.date)
            const dateB = new Date(b.date)
            return dateB.getTime() - dateA.getTime() // Show newest first
          })
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
