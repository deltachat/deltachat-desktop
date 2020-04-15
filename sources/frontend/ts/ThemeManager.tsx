import React from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import {
  defaultTheme,
  ThemeDataBuilder as ThemeBuilder,
  defaultThemeData,
  ThemeVarOverwrite,
} from './ThemeBackend'
const { ipcRenderer } = window.electron_functions

const EventEmitter = window.eventemitter
// do we need an event emitter here?
// if yes please replace it by another module and not use the native electron module

export class ThemeManager extends EventEmitter {
  currentTheme: { [key: string]: string }
  currentThemeData: ReturnType<typeof ThemeBuilder>

  constructor() {
    super()
    const themeJSON = window.localStorage.getItem('theme')
    this.currentTheme = themeJSON !== null ? JSON.parse(themeJSON) : {}
    this.currentThemeData = ThemeBuilder(this.currentTheme)
    window.ThemeManager = this // only for using from the dev console
    ipcRenderer.on('theme-update', (e, data) => this.setTheme(data))
  }

  setTheme(theme: { [key: string]: string }) {
    window.localStorage.setItem('theme', JSON.stringify(theme))
    this.currentTheme = theme
    this.currentThemeData = ThemeBuilder(this.currentTheme)
    this.emit('update')
  }

  getCurrentlyAppliedThemeData() {
    return Object.assign({}, defaultThemeData, this.currentThemeData)
  }

  getCurrentlyAppliedTheme() {
    return Object.assign({}, defaultTheme, this.currentTheme)
  }

  getCurrentTheme() {
    return this.currentTheme
  }

  getDefaultThemeData() {
    return defaultThemeData
  }

  getDefaultTheme() {
    return defaultTheme
  }
}

export const manager = new ThemeManager()

export class ThemeProvider extends React.Component<
  any,
  { theme: ReturnType<typeof ThemeBuilder> }
> {
  constructor(props: any) {
    super(props)
    this.state = {
      theme: manager.getCurrentlyAppliedThemeData(),
    }
    this.update = this.update.bind(this)
  }

  componentDidMount() {
    manager.addListener('update', this.update)
    this.update()
  }

  componentWillUnmount() {
    manager.removeListener('update', this.update)
  }

  update(ev?: any) {
    const theme = manager.getCurrentlyAppliedThemeData()
    this.setState({ theme })
    window.document.getElementById('theme-vars').innerText = ThemeVarOverwrite(
      theme
    )
  }

  render() {
    return (
      <StyledThemeProvider theme={this.state.theme}>
        {this.props.children}
      </StyledThemeProvider>
    )
  }
}
