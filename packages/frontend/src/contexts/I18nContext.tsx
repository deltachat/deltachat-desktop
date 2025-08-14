import { createContext } from 'react'

import { getMessageFunction } from '../../../shared/localize'

export const I18nContext = createContext<{
  tx: getMessageFunction
  writingDirection: 'ltr' | 'rtl'
}>({
  tx: key => key as any,
  writingDirection: 'ltr',
})
