import React from 'react'
import { Switch as BlueprintSwitch } from '@blueprintjs/core'

import type { SwitchProps } from '@blueprintjs/core'
import type { PropsWithChildren } from 'react'

type Props = Pick<
  SwitchProps,
  'alignIndicator' | 'label' | 'disabled' | 'checked'
> & {
  onChange: (value: boolean) => void
}

export default function Switch({
  alignIndicator = 'right',
  ...props
}: PropsWithChildren<Props>) {
  return (
    <BlueprintSwitch
      label={props.label}
      disabled={props.disabled}
      onChange={event => {
        props.onChange(event.currentTarget.checked)
      }}
      alignIndicator={alignIndicator}
      checked={props.checked}
    >
      {props.children}
    </BlueprintSwitch>
  )
}
