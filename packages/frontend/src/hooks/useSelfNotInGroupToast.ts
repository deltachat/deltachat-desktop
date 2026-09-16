import { useEffect } from 'react'

import { onDCEvent } from '../backend-com'
import useToast from './useToast'
import useTranslationFunction from './useTranslationFunction'
import { getLogger } from '@deltachat-desktop/shared/logger'

const log = getLogger('useSelfNotInGroupToast')

/**
 * Notifies the user when core refused an action because we are not a member
 * of the group anymore, e.g. when someone removed us while the "Group"
 * dialog was open.
 *
 * Core reports this with an event instead of an error so it is handled
 * here for all of them at once.
 */
export default function useSelfNotInGroupToast(accountId?: number) {
  const showToast = useToast()
  const tx = useTranslationFunction()

  useEffect(() => {
    if (accountId == undefined) {
      return
    }
    return onDCEvent(accountId, 'ErrorSelfNotInGroup', ({ msg }) => {
      log.warn(msg)
      showToast(tx('group_self_not_in_group'))
    })
  }, [accountId, showToast, tx])
}
