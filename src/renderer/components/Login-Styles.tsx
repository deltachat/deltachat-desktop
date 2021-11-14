import React, { useState } from 'react'
import {
  Button,
  InputGroup,
  FormGroup,
  Intent,
  ProgressBar,
  Switch,
  TextArea,
} from '@blueprintjs/core'
import { useTranslationFunction } from '../contexts'

export const DeltaSelect = React.memo(
  (
    props: React.PropsWithChildren<{
      label: string
      id: any
      value: any
      onChange: (ev: React.ChangeEvent<HTMLSelectElement>) => void
    }>
  ) => {
    const [isFocused, setIsFocused] = useState(false)

    const onFocus = () => setIsFocused(true)
    const onBlur = () => setIsFocused(false)

    return (
      <div className='delta-form-group delta-select'>
        <FormGroup>
          <div className={`label ${isFocused && 'focus'}`}>{props.label}</div>
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
  }
)

export const DeltaSwitch = React.memo(
  (
    props: React.PropsWithChildren<{
      label: string
      id: any
      value: any
      disabled?: boolean
      onChange: (isTrue: boolean) => void
    }>
  ) => {
    return (
      <div className='delta-form-group delta-switch'>
        <FormGroup>
          <Switch
            label={props.label}
            id={props.id}
            disabled={props.disabled}
            onChange={ev => {
              props.onChange(ev.currentTarget.checked)
            }}
            alignIndicator='right'
            checked={props.value === '1'}
          />
        </FormGroup>
      </div>
    )
  }
)

export const DeltaTextarea = React.memo(
  (
    props: React.PropsWithChildren<{
      label?: string
      id?: string
      value: any
      placeholder?: string
      disabled?: boolean
      onChange: (
        event: React.FormEvent<HTMLElement> &
          React.ChangeEvent<HTMLTextAreaElement>
      ) => void
    }>
  ) => {
    const [isFocused, setIsFocused] = useState(false)

    const onFocus = () => setIsFocused(true)
    const onBlur = () => setIsFocused(false)
    const showLabel =
      isFocused ||
      props.value?.length > 0 ||
      (props.label !== undefined && props.label.length > 0)

    const onInput = () => {
      console.log(this)
    }

    return (
      <div className='delta-form-group delta-textarea'>
        <FormGroup>
          <div
            className={`label ${isFocused && 'focus'}`}
            style={{ visibility: !showLabel ? 'hidden' : 'visible' }}
          >
            {props.label && props.label.length > 0
              ? props.label
              : props.placeholder}
          </div>
          <textarea
            onChange={props.onChange}
            value={props.value}
            id={props.id}
            disabled={props.disabled}
            onFocus={onFocus}
            onBlur={onBlur}
            onInput={onInput}
            rows={5}
          />
        </FormGroup>
      </div>
    )
  }
)

export const DeltaInput = React.memo(
  (
    props: React.PropsWithChildren<{
      label?: string
      id?: string
      value: any
      placeholder?: string
      type?: string
      min?: string
      max?: string
      rightElement?: JSX.Element
      disabled?: boolean
      onChange: (
        event: React.FormEvent<HTMLElement> &
          React.ChangeEvent<HTMLInputElement>
      ) => void
    }>
  ) => {
    const [isFocused, setIsFocused] = useState(false)

    const onFocus = () => setIsFocused(true)
    const onBlur = () => setIsFocused(false)
    const showLabel =
      isFocused ||
      props.value?.length > 0 ||
      (props.label !== undefined && props.label.length > 0)

    return (
      <div className='delta-form-group delta-input'>
        <FormGroup>
          <div
            className={`label ${isFocused && 'focus'}`}
            style={{ visibility: !showLabel ? 'hidden' : 'visible' }}
          >
            {props.label && props.label.length > 0
              ? props.label
              : props.placeholder}
          </div>
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
  }
)

export const DeltaPasswordInput = React.memo(
  (
    props: React.PropsWithChildren<{
      password: string
      id?: string
      label?: string
      placeholder?: string
      onChange: (
        event: React.FormEvent<HTMLElement> &
          React.ChangeEvent<HTMLInputElement>
      ) => void
    }>
  ) => {
    const tx = useTranslationFunction()

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
  }
)

export const DeltaProgressBar = function (
  props: React.PropsWithChildren<{
    progress: number
    intent?: Intent
  }>
) {
  return (
    <div style={{ marginTop: '20px', marginBottom: '10px' }}>
      <ProgressBar
        value={props.progress ? props.progress / 1000 : 0}
        intent={Intent.PRIMARY}
        stripes={false}
        animate={false}
      />
    </div>
  )
}
