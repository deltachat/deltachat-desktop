import { useEffect, useState } from 'react'
import { DeltaBackend } from '../../delta-remote'

/** to get a config value when rendering one time, (does NOT refresh automatically!) */
export function useDCConfigOnce(key: string) {
  const [value, setValue] = useState<string>(undefined)
  useEffect(() => {
    DeltaBackend.call('settings.getConfig', key).then(setValue)
  }, [key])
  return value
}
