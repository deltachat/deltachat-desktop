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
      module,
      timestamp,

      extended
    } = this.props
    const moduleName = module || ''

    if (timestamp === null || timestamp === undefined) {
      return null
    }

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
}

module.exports = Timestamp
