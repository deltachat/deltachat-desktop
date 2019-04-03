const moment = require('moment')

const getExtendedFormats = (i18n) => ({
  y: 'lll',
  M: `${i18n('timestamp_format_m_desktop') || 'MMM D'} LT`,
  d: 'ddd LT'
})
const getShortFormats = (i18n) => ({
  y: 'll',
  M: i18n('timestamp_format_m_desktop') || 'MMM D',
  d: 'ddd'
})

function isToday (timestamp) {
  const today = moment().format('ddd')
  const targetDay = moment(timestamp).format('ddd')
  return today === targetDay
}

function isYear (timestamp) {
  const year = moment().format('YYYY')
  const targetYear = moment(timestamp).format('YYYY')
  return year === targetYear
}

function formatRelativeTime (rawTimestamp, options) {
  let { extended, i18n } = options
  i18n = i18n || window.translate
  const formats = extended ? getExtendedFormats(i18n) : getShortFormats(i18n)
  const timestamp = moment(rawTimestamp)
  const now = moment()
  const diff = moment.duration(now.diff(timestamp))

  if (diff.years() >= 1 || !isYear(timestamp)) {
    return timestamp.format(formats.y)
  } else if (diff.months() >= 1 || diff.days() > 6) {
    return timestamp.format(formats.M)
  } else if (diff.days() >= 1 || !isToday(timestamp)) {
    return timestamp.format(formats.d)
  } else if (diff.hours() >= 1) {
    const key = 'n_hours'

    return i18n(key, diff.hours(), { quantity: diff.hours() === 1 ? 'one' : 'other' })
  } else if (diff.minutes() >= 1) {
    const key = 'n_minutes'

    return i18n(key, diff.minutes(), { quantity: diff.minutes() === 1 ? 'one' : 'other' })
  }

  return i18n('now')
}

module.exports = formatRelativeTime
