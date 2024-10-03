import { createContext } from 'react'

import { getMessageFunction } from '../../../shared/localize'

export const I18nContext = createContext<{
  tx: getMessageFunction
  writing_direction: 'ltr' | 'rtl'
}>({
  tx: key => key as any,
  writing_direction: 'ltr',
})
