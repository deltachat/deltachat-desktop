import { useCallback } from 'react'

import { getLogger } from '@deltachat-desktop/shared/logger'
import { runtime } from '@deltachat-desktop/runtime-interface'

import useToast from './useToast'
import useTranslationFunction from './useTranslationFunction'

const log = getLogger('renderer/hooks/useRequestUserPresence')

/**
 * Asks the operating system to confirm that the device owner is present
 * (Touch ID / account password on macOS, Windows Hello on Windows) before
 * continuing with an action.
 *
 * This guards against someone using an unattended device, it is no protection
 * against software running as the user.
 *
 * On platforms without such a prompt the action continues unguarded, so it
 * stays reachable there.
 *
 * @returns whether the action may continue
 */
export default function useRequestUserPresence() {
  const tx = useTranslationFunction()
  const showToast = useToast()

  return useCallback(
    /** @param reason what is being authorized, macOS shows it as
     * "<app> is trying to <reason>", so keep it a verb phrase */
    async (reason: string): Promise<boolean> => {
      const status = await runtime.requestUserPresence(reason)
      switch (status) {
        case 'authenticated':
          return true
        case 'cancelled':
          return false
        case 'failed':
          showToast(tx('user_presence_failed'))
          return false
        case 'unsupported':
          log.info('user presence is not supported, continuing unguarded')
          return true
      }
    },
    [showToast, tx]
  )
}
