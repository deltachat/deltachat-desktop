const React = require('react')
const classNames = require('classnames')
const moment = require('moment')
const formatRelativeTime = require('./formatRelativeTime')

const UPDATE_FREQUENCY = 60 * 1000

class Timestamp extends React.Component {
  constructor (props) {
    super(props)
    this.interval = null
  }

  componentDidMount () {
    const update = () => {
      this.setState({
        lastUpdated: Date.now()
      })
    }
    this.interval = setInterval(update, UPDATE_FREQUENCY)
  }

  componentWillUnmount () {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  render () {
    const {
      direction,
      i18n,
      module,
      timestamp,
      withImageNoCaption,
      extended
    } = this.props
    const moduleName = module || 'module-timestamp'

    if (timestamp === null || timestamp === undefined) {
      return null
    }

    return (
      <span
        className={classNames(
          moduleName,
          direction ? `${moduleName}--${direction}` : null,
          withImageNoCaption ? `${moduleName}--with-image-no-caption` : null
        )}
        title={moment(timestamp).format('llll')}
      >
        {formatRelativeTime(timestamp, { i18n, extended })}
      </span>
    )
  }
}

module.exports = Timestamp
