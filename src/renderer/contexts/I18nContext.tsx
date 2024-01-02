import { createContext } from 'react'

import type { getMessageFunction } from '../../shared/localize'

export const I18nContext = createContext<getMessageFunction>(key => key as any)
