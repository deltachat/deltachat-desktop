const React = require('react')
const classNames = require('classnames')
const { padStart } = require('lodash')

class ExpireTimer extends React.Component {
  constructor (props) {
    super(props)
    this.interval = null
  }

  componentDidMount () {
    const { expirationLength } = this.props
    const increment = getIncrement(expirationLength)
    const updateFrequency = Math.max(increment, 500)

    const update = () => {
      this.setState({
        lastUpdated: Date.now()
      })
    }
    this.interval = setInterval(update, updateFrequency)
  }

  componentWillUnmount () {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  render () {
    const {
      direction,
      expirationLength,
      expirationTimestamp,
      withImageNoCaption
    } = this.props

    const bucket = getTimerBucket(expirationTimestamp, expirationLength)

    return (
      <div
        className={classNames(
          'module-expire-timer',
          `module-expire-timer--${bucket}`,
          `module-expire-timer--${direction}`,
          withImageNoCaption
            ? 'module-expire-timer--with-image-no-caption'
            : null
        )}
      />
    )
  }
}

function getIncrement (length) {
  if (length < 0) {
    return 1000
  }

  return Math.ceil(length / 12)
}

function getTimerBucket (expiration, length) {
  const delta = expiration - Date.now()
  if (delta < 0) {
    return '00'
  }
  if (delta > length) {
    return '60'
  }

  const bucket = Math.round(delta / length * 12)

  return padStart(String(bucket * 5), 2, '0')
}

module.exports = { ExpireTimer, getIncrement }
