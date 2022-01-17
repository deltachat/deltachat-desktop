import React, { useState, useEffect, useCallback } from 'react'
import classNames from 'classnames'
import moment from 'moment'
import formatRelativeTime from './formatRelativeTime'
import { useTranslationFunction } from '../../contexts'

const UPDATE_FREQUENCY = 60 * 1000

// This hook allows running a callback every delay milliseconds. It takes
// care of clearing the interval on component unmount.
export function useInterval(callback: () => void, delay: number) {
  useEffect(() => {
    let mounted = true
    if (delay === null || callback === null) return

    const interval = setInterval(() => {
      if (mounted === true) callback()
    }, delay)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [callback, delay])
}

type TimestampProps = {
  direction?: 'incoming' | 'outgoing'
  module: string
  timestamp: number
  extended: boolean
}

const NonUpdatingTimestamp = function Timestamp(props: TimestampProps) {
  const { direction, timestamp, extended } = props
  const moduleName = props.module || ''

  return (
    <span
      className={classNames(
        moduleName,
        direction ? `${moduleName}--${direction}` : null
      )}
      title={moment(timestamp).format('llll')}
    >
      {formatRelativeTime(timestamp, { extended })}
    </span>
  )

}


const UpdatingTimestamp = (props: TimestampProps) => {
  const { direction, timestamp, extended } = props
  const moduleName = props.module || ''
  const calculateRelativeTime = useCallback(
    () => formatRelativeTime(timestamp, { extended }),
    [timestamp, extended]
  )
  const [relativeTime, setRelativeTime] = useState(calculateRelativeTime())
  // Update relative time every UPDATE_FREQUENCY ms
  const recalculateRelativeTime = useCallback(
    () => setRelativeTime(calculateRelativeTime()),
    [calculateRelativeTime]
  )
  useInterval(recalculateRelativeTime, UPDATE_FREQUENCY)
  useEffect(recalculateRelativeTime, [
    timestamp,
    window.localeData.locale,
    recalculateRelativeTime,
  ])

  // trigger a rerender that will be detected as a language change by the useEffect function above (window.localeData.locale)
  //useTranslationFunction()

  if (timestamp === null || timestamp === undefined) return null

  return (
    <span
      className={classNames(
        moduleName,
        direction ? `${moduleName}--${direction}` : null
      )}
      title={moment(timestamp).format('llll')}
    >
      {relativeTime}
    </span>
  )
}

export default function Timestamp(props: TimestampProps) {
  // if older than one week we don't need to update timestamps
  if (props.timestamp < (Date.now() - 24 * 60 * 60 * 7)) {
    return <NonUpdatingTimestamp {...props} />
  }
  return <UpdatingTimestamp {...props} />
}
