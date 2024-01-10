import { useContext } from 'react'

import { ReactionsBarContext } from '.'

export default function useReactionsBar() {
  const context = useContext(ReactionsBarContext)

  if (!context) {
    throw new Error(
      'useReactionsBar has to be used within <ReactionsBarProvider>'
    )
  }

  return context
}
