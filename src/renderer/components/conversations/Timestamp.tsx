import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import moment from 'moment'
import formatRelativeTime from './formatRelativeTime'

const UPDATE_FREQUENCY = 60 * 1000

// This hook allows running a callback every delay milliseconds. It takes
// care of clearing the interval on component unmount.
export function useInterval(callback: () => void, delay: number) {
  useEffect(() => {
    if (delay === null || callback === null) return

    const interval = setInterval(() => {
      callback()
    }, delay)
    return () => clearInterval(interval)
  }, [callback, delay])
}

type TimestampProps = {
  direction?: 'incoming' | 'outgoing'
  module: string
  timestamp: number
  extended: boolean
}

const Timestamp = React.memo(function Timestamp(props: TimestampProps) {
  const { direction, timestamp, extended } = props
  const moduleName = props.module || ''

  if (timestamp === null || timestamp === undefined) return null

  const calculateRelativeTime = () =>
    formatRelativeTime(timestamp, { extended })
  const [relativeTime, setRelativeTime] = useState(() =>
    calculateRelativeTime()
  )

  // Update relative time every UPDATE_FREQUENCY ms
  const recalculateRelativeTime = () => setRelativeTime(calculateRelativeTime())
  useInterval(recalculateRelativeTime, UPDATE_FREQUENCY)

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
})

export default Timestamp
