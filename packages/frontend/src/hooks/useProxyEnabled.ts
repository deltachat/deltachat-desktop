import { useSettingsStore } from '../stores/settings'
import { Proxy } from '../components/Settings/DefaultCredentials'

/**
 * Whether a proxy is currently enabled in the desktop settings.
 *
 * Returns `false` while the settings store is still loading.
 */
export default function useProxyEnabled(): boolean {
  const settingsStore = useSettingsStore()[0]
  return settingsStore?.settings.proxy_enabled === Proxy.ENABLED
}
