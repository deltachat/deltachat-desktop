import { useContext } from 'react'

import { AccountContext } from '../contexts/AccountContext'

import type { AccountValue } from '../contexts/AccountContext'

export default function useAccount(): AccountValue {
  const context = useContext(AccountContext)

  if (!context) {
    throw new Error('useAccount has to be used within <AccountProvider>')
  }

  return context
}
