import React, { useState, useEffect, useCallback } from 'react'
import classNames from 'classnames'
import moment from 'moment'
import formatRelativeTime from './formatRelativeTime'
import { getLogger } from '../../../shared/logger'

const log = getLogger('renderer/Component/Timestamp')

const UPDATE_FREQUENCY = 60 * 1000
const DEDUPLICATION_COUNTER_ROLLOVER = 999

// object that holds references to the update functions of the currently active Timestamp elements
let updateRefs: { [key: string]: () => void } = {}
// to prevent same key on same timestamp
let deduplicationCounter = 0

function updateTimestamps() {
  log.debug('updateTS:', { updateRefs })

  for (const key in updateRefs) {
    if (Object.prototype.hasOwnProperty.call(updateRefs, key)) {
      if (updateRefs[key]) {
        updateRefs[key]()
      }
    }
  }

  if (deduplicationCounter >= DEDUPLICATION_COUNTER_ROLLOVER) {
    deduplicationCounter = 0
  }
}

window.addEventListener('focus', updateTimestamps)
setInterval(updateTimestamps, UPDATE_FREQUENCY)

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

  useEffect(() => {
    //register in global updater
    const key = `${timestamp}|${deduplicationCounter++}`
    updateRefs[key] = recalculateRelativeTime
    recalculateRelativeTime()
    return () => {
      delete updateRefs[key]
    }
  }, [timestamp, window.localeData.locale, recalculateRelativeTime])

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
  if (props.timestamp < Date.now() - 24 * 60 * 60 * 7) {
    return <NonUpdatingTimestamp {...props} />
  }
  return <UpdatingTimestamp {...props} />
}
