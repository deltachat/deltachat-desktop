const React = require('react')
const StyledThemeProvider = require('styled-components').ThemeProvider
const { EventEmitter } = require('events')

const defaultTheme = Object.freeze({
  deltaPrimaryBg: '#415e6b',
  deltaPrimaryBgLight: '#4c6e7d',
  deltaPrimaryFg: '#ffffff',
  deltaPrimaryFgLight: '#d0d0d0',
  deltaHover: '#ececec',
  deltaChatPrimaryFg: '#070c14',
  deltaChatPrimaryFgLight: '#62656a',
  deltaChatMessageBubbleSelf: '#efffde',
  deltaChatMessageBubbleOther: '#ffffff',
  deltaInfoMessageBubbleBg: '#000000',
  deltaInfoMessageBubbleColor: 'white',
  deltaChatMessageBubbleSelfStatusColor: '#4caf50',
  deltaFocusBlue: '#42A5F5',
  deltaSelected: '#4c6e7d' // same as deltaPrimaryBgLight
})

class ThemeManager extends EventEmitter {
  constructor () {
    super()
    const themeJSON = window.localStorage.getItem('theme')
    this.currentTheme = themeJSON !== null ? JSON.parse(themeJSON) : {}

    window.ThemeManager = this // only for using fron the dev console
  }

  setTheme (theme) {
    window.localStorage.setItem('theme', JSON.stringify(theme))
    this.currentTheme = theme
    this.emit('update')
  }

  getCurrentTheme () {
    return Object.assign({}, defaultTheme, this.currentTheme)
  }
}

const manager = new ThemeManager()

class ThemeProvider extends React.Component {
  constructor () {
    super()
    this.state = {
      theme: manager.getCurrentTheme()
    }
    this.update = this.update.bind(this)
  }

  componentDidMount () {
    manager.addListener('update', this.update)
  }

  componentWillUnmount () {
    manager.removeListener('update', this.update)
  }

  update (ev) {
    console.log(ev)
    this.setState({ theme: manager.getCurrentTheme() })
  }

  render () {
    return <StyledThemeProvider theme={this.state.theme}>
      {this.props.children}
    </StyledThemeProvider>
  }
}

module.exports = {
  defaultTheme,
  manager,
  ThemeProvider
}
