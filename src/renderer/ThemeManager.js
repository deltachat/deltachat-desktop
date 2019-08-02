const React = require('react')
const StyledThemeProvider = require('styled-components').ThemeProvider
const { EventEmitter } = require('events')
const { defaultTheme, ThemeDataBuilder: ThemeBuilder, defaultThemeData, ThemeVarOverwrite } = require('./ThemeBackend.js')
const { ipcRenderer } = require('electron')

class ThemeManager extends EventEmitter {
  constructor () {
    super()
    const themeJSON = window.localStorage.getItem('theme')
    this.currentTheme = themeJSON !== null ? JSON.parse(themeJSON) : {}
    this.currentThemeData = ThemeBuilder(this.currentTheme)
    window.ThemeManager = this // only for using from the dev console
    ipcRenderer.on('theme-update', (e, data) => this.setTheme(data))
  }

  setTheme (theme) {
    window.localStorage.setItem('theme', JSON.stringify(theme))
    this.currentTheme = theme
    this.currentThemeData = ThemeBuilder(this.currentTheme)
    this.emit('update')
  }

  getCurrentlyAppliedThemeData () {
    return Object.assign({}, defaultThemeData, this.currentThemeData)
  }

  getCurrentlyAppliedTheme () {
    return Object.assign({}, defaultTheme, this.currentTheme)
  }

  getCurrentTheme () {
    return this.currentTheme
  }

  getDefaultThemeData () {
    return defaultThemeData
  }

  getDefaultTheme () {
    return defaultTheme
  }
}

const manager = new ThemeManager()

class ThemeProvider extends React.Component {
  constructor () {
    super()
    this.state = {
      theme: manager.getCurrentlyAppliedThemeData()
    }
    this.update = this.update.bind(this)
  }

  componentDidMount () {
    manager.addListener('update', this.update)
    this.update()
  }

  componentWillUnmount () {
    manager.removeListener('update', this.update)
  }

  update (ev) {
    const theme = manager.getCurrentlyAppliedThemeData()
    this.setState({ theme })
    window.document.getElementById('dom-root').style = ThemeVarOverwrite(theme)
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
