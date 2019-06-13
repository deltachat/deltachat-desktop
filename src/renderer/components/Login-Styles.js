import React, { useState } from 'react'
import styled from 'styled-components'
import {
  Button,
  InputGroup,
  FormGroup,
  Intent
} from '@blueprintjs/core'

export const AdvancedButton = styled.div`
  -webkit-appearance: button-bevel;
  background-color: transparent;
  color: ${props => props.theme.deltaFocusBlue};;
  font-size: 16px;
  display: block;
  width: 100%; 
  margin-top: 30px;
  &:hover {
    cursor: pointer;
  }
  p {
    margin-left: 8px;
    display: -webkit-inline-box;
    position: relative;
    font-size: 18px;
    margin-bottom: 0px;
    bottom: 3px;
  }
`

export const AdvancedButtonIconOpen = styled.div`
  width: 20px;
  height: 20px;
  -webkit-mask: url(../images/dc-cross.svg) no-repeat center;
  -webkit-mask-size: 100%;
  background-color: ${props => props.theme.deltaFocusBlue};
  display: -webkit-inline-box;
`

export const AdvancedButtonIconClosed = styled(AdvancedButtonIconOpen)`
  transform: rotate(45deg);
`

export const DeltaFormGroup = styled.div`
  .bp3-form-content { 
    padding: 0px 10px 0px 10px;
  }
`

export const DeltaSelectWrapper = styled(DeltaFormGroup)`
  .bp3-select::after {
    content:'>';
    font:11px "Consolas", monospace;
    transform:rotate(90deg);
  }
  .bp3-select {
    width: 100%;
    select {
     -webkit-box-shadow: none;
      box-shadow: none;
      background-image: none;
      background-color: transparent;
      width: 100%;
      color: ${props => props.theme.deltaChatPrimaryFgLight};
      font-size: 17px;
      &:hover, &:focus {
        outline: unset;
        outline-offset: unset;
      }
    }
  }
  .bp3-form-group label.bp3-label {
    padding-left: 10px;
    color: ${props => props.theme.deltaChatPrimaryFgLight};
    font-size: 16px; 
  }
`

export const DeltaSelect = React.memo((props) => {
  const [ isFocused, setIsFocused ] = useState(false)

  const onFocus = () => setIsFocused(true)
  const onBlur = () => setIsFocused(false)

  return (
    <DeltaSelectWrapper>
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
    </DeltaSelectWrapper>
  )
})

export const DeltaInputWrapper = styled(DeltaFormGroup)`
  .bp3-input {
    padding: unset;
    border-radius: unset;
    -webkit-box-shadow: none;
    box-shadow: none;
    border-bottom: 2px solid;
    border-bottom-color: ${props => props.theme.deltaChatPrimaryFgLight};
    font-size: 16px; 

    &:focus {
      border-bottom-color: ${props => props.theme.deltaFocusBlue};
      color: ${props => props.theme.deltaFocusBlue};
    }

    &:focus::placeholder {
      color: transparent;
    }
    &::placeholder {
      color: ${props => props.theme.deltaChatPrimaryFgLight};
    }
  }

  .bp3-button.bp3-minimal.bp3-intent-warning, .bp3-button.bp3-minimal.bp3-intent-warning:hover {
    color: #62656a !important;
  }

  .bp3-button.bp3-minimal.bp3-intent-warning:hover {
    background-color: #d0d0d0 !important;
  }
`

export const DeltaLabel = styled.div`
    visibility: ${props => props.visible === false ? 'hidden' : 'visible'};
    height: 13px;
    font-size: 13px;
    line-height: 13px;
    width: 100%;
    color: ${props => props.focus === true
    ? props.theme.deltaFocusBlue
    : props.theme.deltaChatPrimaryFgLight};
`

export const DeltaInput = React.memo((props) => {
  const [ isFocused, setIsFocused ] = useState(false)

  const onFocus = () => setIsFocused(true)
  const onBlur = () => setIsFocused(false)

  return (
    <DeltaInputWrapper>
      <FormGroup>
        <DeltaLabel
          visible={isFocused || props.value.length > 0}
          focus={isFocused}
        >{props.placeholder}
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
    </DeltaInputWrapper>
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
    />
  )

  return (
    <DeltaInput
      id={props.id}
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={props.onChange}
      placeholder={props.placeholder}
      rightElement={lockButton}
    />
  )
})

export const ProgressBarWrapper = styled.div`
margin-top: 20px
`

export const DeltaText = styled.p`
  color: ${props => props.theme.deltaChatPrimaryFgLight};
`

export const DeltaHeadline = styled.p`
  color: ${props => props.theme.deltaChatPrimaryFgLight};
  font-size: 18px;
  padding: 15px 0 3px;`
