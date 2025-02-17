import React from 'react'
import { AppPicker, AppInfo } from '../AppPicker'

type Props = {
  onAppSelected?: (app: AppInfo) => void
}

export const AppPickerWrapper = ({ onAppSelected }: Props) => {
  return <AppPicker onSelect={onAppSelected} />
}
