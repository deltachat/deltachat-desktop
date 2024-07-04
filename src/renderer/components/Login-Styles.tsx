import React, { useState } from 'react'
import Button from './Button'
import Icon from './Icon'
import Switch from './Switch'
import useTranslationFunction from '../hooks/useTranslationFunction'

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
        <div className={`label ${isFocused && 'focus'}`}>{props.label}</div>
        <div className='.modifier'>
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
        <Switch
          label={props.label}
          id={props.id}
          disabled={props.disabled || false}
          onChange={changed => {
            props.onChange(changed)
          }}
          alignIndicator='right'
          checked={props.value === '1'}
        />
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

    return (
      <div className='delta-form-group delta-textarea'>
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
          placeholder={!isFocused ? props.placeholder : ''}
          onFocus={onFocus}
          onBlur={onBlur}
          rows={5}
        />
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
      onBlur?: (
        event: React.FormEvent<HTMLElement> & React.FocusEvent<HTMLInputElement>
      ) => void
    }>
  ) => {
    const [isFocused, setIsFocused] = useState(false)

    const onFocus = () => setIsFocused(true)
    const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      if (props.onBlur) props.onBlur(event)
    }
    const showLabel =
      isFocused ||
      props.value?.length > 0 ||
      (props.label !== undefined && props.label.length > 0)

    return (
      <div className='delta-form-group delta-input'>
        <div
          className={`label ${isFocused && 'focus'}`}
          style={{ visibility: !showLabel ? 'hidden' : 'visible' }}
        >
          {props.label && props.label.length > 0
            ? props.label
            : props.placeholder}
        </div>
        <input
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
        />
        {props.rightElement && (
          <div className='right-element'>{props.rightElement}</div>
        )}
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

    const rightElement = (
      <Button
        styling='minimal'
        type='danger'
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? tx('hide_password') : tx('show_password')}
      >
        <Icon
          coloring='context-menu'
          size={16}
          icon={showPassword ? 'eye-open' : 'eye-off'}
        />
      </Button>
    )
    return (
      <>
        <DeltaInput
          id={props.id}
          type={showPassword ? 'text' : 'password'}
          label={props.label ? props.label : ''}
          value={password}
          onChange={props.onChange}
          placeholder={props.placeholder}
          rightElement={rightElement}
        />
      </>
    )
  }
)

export const DeltaProgressBar = function (
  props: React.PropsWithChildren<{
    progress: number
    intent?: string
  }>
) {
  return (
    <div style={{ marginTop: '20px', marginBottom: '10px' }}>
      <progress
        value={props.progress ? props.progress / 1000 : 0}
        max={100}
        //intent={Intent.PRIMARY}
        // stripes={false}
        // animate={false}
      ></progress>
    </div>
  )
}
