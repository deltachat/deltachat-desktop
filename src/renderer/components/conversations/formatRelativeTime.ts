import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)
import localizedFormat from 'dayjs/plugin/localizedFormat'
dayjs.extend(localizedFormat)

const getExtendedFormats = () => ({
  y: 'lll',
  M: `${window.static_translate('timestamp_format_m_desktop') || 'MMM D'} LT`,
  d: 'ddd LT',
})
const getShortFormats = () => ({
  y: 'll',
  M: window.static_translate('timestamp_format_m_desktop') || 'MMM D',
  d: 'ddd',
})

function isToday(timestamp: dayjs.Dayjs) {
  const today = dayjs().format('ddd')
  const targetDay = dayjs(timestamp).format('ddd')
  return today === targetDay
}

function isYear(timestamp: dayjs.Dayjs) {
  const year = dayjs().format('YYYY')
  const targetYear = dayjs(timestamp).format('YYYY')
  return year === targetYear
}

export default function formatRelativeTime(
  rawTimestamp: number,
  options: { extended: boolean }
) {
  const { extended } = options
  const tx = window.static_translate
  const formats = extended ? getExtendedFormats() : getShortFormats()
  const timestamp = dayjs(rawTimestamp)
  const now = dayjs()
  const diff = dayjs.duration(now.diff(timestamp))

  if (diff.years() >= 1 || !isYear(timestamp)) {
    return timestamp.format(formats.y)
  } else if (diff.months() >= 1 || diff.days() > 6) {
    return timestamp.format(formats.M)
  } else if (diff.days() >= 1 || !isToday(timestamp)) {
    return timestamp.format(formats.d)
  } else if (diff.hours() >= 1) {
    const key = 'n_hours'

    return tx(key, String(diff.hours()), {
      quantity: diff.hours() === 1 ? 'one' : 'other',
    })
  } else if (diff.minutes() >= 1) {
    const key = 'n_minutes'

    return tx(key, String(diff.minutes()), {
      quantity: diff.minutes() === 1 ? 'one' : 'other',
    })
  }

  return tx('now')
}
