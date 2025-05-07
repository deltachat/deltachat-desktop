import React, { useRef, useState } from 'react'
import Button from './Button'
import Icon from './Icon'
import useTranslationFunction from '../hooks/useTranslationFunction'

export const DeltaSelect = React.memo(
  (
    props: React.PropsWithChildren<{
      label: string
      id?: string
      value: any
      onChange: (ev: React.ChangeEvent<HTMLSelectElement>) => void
    }>
  ) => {
    const defaultId = useRef(`delta-select-${Math.random()}`)
    const id = props.id ?? defaultId.current

    return (
      <div className='delta-form-group delta-select'>
        <label htmlFor={id}>{props.label}</label>
        <div className='delta-select-inner'>
          <select
            name={id}
            id={id}
            value={props.value === null ? '' : props.value}
            onChange={props.onChange}
          >
            {props.children}
          </select>
        </div>
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
    const defaultId = useRef(`delta-textarea-${Math.random()}`)
    const id = props.id ?? defaultId.current

    const alwaysShowLabel = (props.label?.length ?? 0) > 0

    return (
      <div className='delta-form-group delta-textarea'>
        <label
          htmlFor={id}
          className={alwaysShowLabel ? 'alwaysShow' : undefined}
        >
          {props.label && props.label.length > 0
            ? props.label
            : props.placeholder}
        </label>
        <textarea
          onChange={props.onChange}
          value={props.value}
          id={id}
          disabled={props.disabled}
          placeholder={props.placeholder}
          rows={5}
          className={(props.value?.length ?? 0) === 0 ? 'isEmpty' : undefined}
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
      autoFocus?: boolean
      onChange: (
        event: React.FormEvent<HTMLElement> &
          React.ChangeEvent<HTMLInputElement>
      ) => void
      onBlur?: (
        event: React.FormEvent<HTMLElement> & React.FocusEvent<HTMLInputElement>
      ) => void
    }>
  ) => {
    const defaultId = useRef(`delta-input-${Math.random()}`)
    const id = props.id ?? defaultId.current

    const alwaysShowLabel = (props.label?.length ?? 0) > 0

    return (
      <div className='delta-form-group delta-input'>
        <label
          htmlFor={id}
          className={alwaysShowLabel ? 'alwaysShow' : undefined}
        >
          {props.label && props.label.length > 0
            ? props.label
            : props.placeholder}
        </label>
        <input
          id={id}
          type={props.type}
          value={props.value === null ? '' : props.value}
          onChange={props.onChange}
          placeholder={props.placeholder}
          min={props.min}
          max={props.max}
          disabled={props.disabled}
          onBlur={props.onBlur}
          autoFocus={props.autoFocus}
          className={(props.value?.length ?? 0) === 0 ? 'isEmpty' : undefined}
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
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? tx('hide_password') : tx('show_password')}
      >
        <Icon
          coloring='contextMenu'
          size={16}
          icon={showPassword ? 'eye-open' : 'eye-off'}
        />
      </Button>
    )
    return (
      <DeltaInput
        id={props.id}
        type={showPassword ? 'text' : 'password'}
        label={props.label ? props.label : ''}
        value={password === null ? '' : password}
        onChange={props.onChange}
        placeholder={props.placeholder}
        rightElement={rightElement}
      />
    )
  }
)

type DeltaIntent = 'primary' | 'success' | 'danger'

type ProgressBarProps = React.PropsWithChildren<{
  /**
   * Min is 0, max is {@link ProgressBarProps.max}
   */
  progress: number
  /**
   * @default 1000
   * for reasons see <https://github.com/deltachat/deltachat-core-rust/blob/75fe4e106a740f8e3205d0bb56ce676fb2cd2411/deltachat-ffi/deltachat.h#L2928>
   */
  max?: number
  intent?: DeltaIntent
}>

export const DeltaProgressBar = React.memo<ProgressBarProps>(
  ({ progress, intent = 'primary', max = 1000 }) => {
    const progressPercent = ((progress || 0) * 100) / max
    return (
      <div style={{ marginTop: '20px', marginBottom: '10px' }}>
        <div
          className={`delta-progress-bar delta-intent-${intent}`}
          role='progressbar'
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className='bar' style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>
    )
  }
)
