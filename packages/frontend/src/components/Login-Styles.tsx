import React, { ReactElement, useId } from 'react'

export const DeltaSelect = React.memo(
  (
    props: React.PropsWithChildren<{
      label: string
      id?: string
      value: any
      onChange: (ev: React.ChangeEvent<HTMLSelectElement>) => void
    }>
  ) => {
    const defaultId = useId()
    const id = props.id ?? `delta-select-${defaultId}`

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
    const defaultId = useId()
    const id = props.id ?? `delta-textarea-${defaultId}`

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
      rightElement?: ReactElement
      disabled?: boolean
      autoFocus?: boolean
      onChange: (
        event: React.FormEvent<HTMLElement> &
          React.ChangeEvent<HTMLInputElement>
      ) => void
      onBlur?: (
        event: React.FormEvent<HTMLElement> & React.FocusEvent<HTMLInputElement>
      ) => void
      dataTestId?: string
    }>
  ) => {
    const defaultId = useId()
    const id = props.id ?? `delta-input-${defaultId}`

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
          data-testid={props.dataTestId}
        />
        {props.rightElement && (
          <div className='right-element'>{props.rightElement}</div>
        )}
      </div>
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
