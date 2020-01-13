import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import moment from 'moment'
import formatRelativeTime from './formatRelativeTime'

const UPDATE_FREQUENCY = 60 * 1000

export function useInterval (callback, delay) {
  useEffect(() => {
    if (delay === null || callback === null) return

    const interval = setInterval(() => { callback() }, delay)
    return () => clearInterval(interval)
  }, [callback, delay])
}

const Timestamp = React.memo(function Timestamp (props) {
  const { direction, module, timestamp, extended } = props
  const moduleName = module || ''

  if (timestamp === null || timestamp === undefined) return null

  const calculateRelativeTime = () => formatRelativeTime(timestamp, { extended })
  const [relativeTime, setRelativeTime] = useState(() => calculateRelativeTime())

  // Update relative time every UPDATE_FREQUENCY ms
  const recalculateRelativeTime = () => setRelativeTime(calculateRelativeTime())
  useInterval(recalculateRelativeTime, UPDATE_FREQUENCY)

  return (
    <span
      className={classNames(moduleName, direction ? `${moduleName}--${direction}` : null)}
      title={moment(timestamp).format('llll')}
    >
      {relativeTime}
    </span>
  )
})

export default Timestamp
