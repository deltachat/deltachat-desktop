import { useContext } from 'react'

import { ToastContext } from '../contexts/ToastContext'

export default function useToast() {
  return useContext(ToastContext).showToast
}
