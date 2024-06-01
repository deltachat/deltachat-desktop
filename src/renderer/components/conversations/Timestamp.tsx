import React, { useState, useEffect, useCallback } from 'react'
import classNames from 'classnames'
import { DateTime } from 'luxon'
import formatRelativeTime, { FULL_HUMAN_DATE_TIME } from './formatRelativeTime'
import { getLogger } from '../../../shared/logger'
import useTranslationFunction from '../../hooks/useTranslationFunction'

const log = getLogger('renderer/Component/Timestamp')

const UPDATE_FREQUENCY = 60 * 1000
const DEDUPLICATION_COUNTER_ROLLOVER = 999

// object that holds references to the update functions of the currently active Timestamp elements
const updateRefs: { [key: string]: () => void } = {}
// to prevent same key on same timestamp
let deduplicationCounter = 0

export function updateTimestamps() {
  if (document.hidden) {
    log.debug('updateTS: canceled page not visible')
    return
  } else {
    log.debug('updateTS:', { updateRefs })
  }

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
      title={DateTime.fromMillis(timestamp).toLocaleString(
        FULL_HUMAN_DATE_TIME
      )}
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
  }, [timestamp, recalculateRelativeTime])

  if (timestamp === null || timestamp === undefined) return null

  return (
    <span
      className={classNames(
        moduleName,
        direction ? `${moduleName}--${direction}` : null
      )}
      title={DateTime.fromMillis(timestamp).toLocaleString(
        FULL_HUMAN_DATE_TIME
      )}
    >
      {relativeTime}
    </span>
  )
}

const relativeTimeThreshold = 24 * 60 * 60 * 1000 // one day

export default function Timestamp(props: TimestampProps) {
  // make sure timestamps are re-rendered if translation changes
  useTranslationFunction()
  // if older than one week we don't need to update timestamps
  if (props.timestamp < Date.now() - relativeTimeThreshold) {
    return <NonUpdatingTimestamp {...props} />
  }
  return <UpdatingTimestamp {...props} />
}
