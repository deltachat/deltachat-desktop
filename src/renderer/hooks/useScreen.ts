import { useContext } from 'react'

import { ScreenContext } from '../contexts/ScreenContext'

import type { ScreenValue } from '../contexts/ScreenContext'

export default function useScreen(): ScreenValue {
  const context = useContext(ScreenContext)

  if (!context) {
    throw new Error('useScreen has to be used within <ScreenProvider>')
  }

  return context
}
