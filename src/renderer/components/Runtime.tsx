import React, { useEffect } from 'react'

import useProcessQr from '../hooks/useProcessQr'
import { runtime } from '../runtime'
import { selectedAccountId } from '../ScreenController'

import type { PropsWithChildren } from 'react'

/**
 * Helper component to hook React methods into the external "runtime". This
 * allows us to interact with the underlying Electron runtime and
 * operating system.
 */
export default function Runtime({ children }: PropsWithChildren<{}>) {
  const processQr = useProcessQr()

  useEffect(() => {
    runtime.onOpenQrUrl = (url: string) => {
      const accountId = selectedAccountId()
      processQr(accountId, url)
    }
  }, [processQr])

  return <>{children}</>
}
