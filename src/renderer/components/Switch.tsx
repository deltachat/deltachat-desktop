import { Switch as BlueprintSwitch } from '@blueprintjs/core'
import React from 'react'

import type { SwitchProps } from '@blueprintjs/core'

type Props = Pick<SwitchProps, 'label' | 'disabled' | 'checked'> & {
  onChange: (value: boolean) => void
}

export default function Switch(props: Props) {
  return (
    <BlueprintSwitch
      label={props.label}
      disabled={props.disabled}
      onChange={event => {
        props.onChange(event.currentTarget.checked)
      }}
      alignIndicator='right'
      checked={props.checked}
    />
  )
}
