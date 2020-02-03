import React, { useState } from 'react'
import styled from 'styled-components'
import {
  Button,
  InputGroup,
  FormGroup,
  Intent,
  ProgressBar
} from '@blueprintjs/core'

export const DeltaSelect = React.memo((props) => {
  const [isFocused, setIsFocused] = useState(false)

  const onFocus = () => setIsFocused(true)
  const onBlur = () => setIsFocused(false)

  return (
    <div className='delta-form-group delta-select'>
      <FormGroup>
        <DeltaLabel focus={isFocused}>{props.label}</DeltaLabel>
        <div className='bp3-select .modifier'>
          <select
            id={props.id}
            value={props.value}
            onChange={props.onChange}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            {props.children}
          </select>
        </div>
      </FormGroup>
    </div>
  )
})

export const DeltaLabel = styled.div`
    visibility: ${props => props.visible === false ? 'hidden' : 'visible'};
    height: 13px;
    font-size: 13px;
    line-height: 13px;
    width: 100%;
    color: ${props => props.focus === true
    ? props.theme.loginInputFocusColor
    : props.theme.deltaChatPrimaryFgLight};
`

export const DeltaInput = React.memo((props) => {
  const [isFocused, setIsFocused] = useState(false)

  const onFocus = () => setIsFocused(true)
  const onBlur = () => setIsFocused(false)
  const showLabel = isFocused || props.value.length > 0 || (props.label !== undefined && props.label.length > 0)

  return (
    <div className='delta-form-group delta-input'>
      <FormGroup>
        <DeltaLabel
          visible={showLabel}
          focus={isFocused}
        >{(props.label && props.label.length > 0) ? props.label : props.placeholder}
        </DeltaLabel>
        <InputGroup
          id={props.id}
          type={props.type}
          value={props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          min={props.min}
          max={props.max}
          disabled={props.disabled}
          onFocus={onFocus}
          onBlur={onBlur}
          rightElement={props.rightElement}
        />
      </FormGroup>
    </div>
  )
})

export const DeltaPasswordInput = React.memo((props) => {
  const tx = window.translate

  const [showPassword, setShowPassword] = useState(false)

  const password = props.password || ''

  const lockButton = (
    <Button
      icon={showPassword ? 'eye-open' : 'eye-off'}
      title={showPassword ? tx('hide_password') : tx('show_password')}
      intent={Intent.WARNING}
      minimal
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? tx('hide_password') : tx('show_password')}
    />
  )

  return (
    <DeltaInput
      id={props.id}
      type={showPassword ? 'text' : 'password'}
      label={props.label ? props.label : ''}
      value={password}
      onChange={props.onChange}
      placeholder={props.placeholder}
      rightElement={lockButton}
    />
  )
})

export const DeltaProgressBar = function (props) {
  return (
    <div style={{ 'margin-top': '20px', 'margin-bottom': '10px' }}>
      <ProgressBar
        value={props.progress ? props.progress / 1000 : 0}
        intent={props.intent}
      />
    </div>
  )
}
