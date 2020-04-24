import React from 'react'
import {
  defaultTheme,
  ThemeDataBuilder as ThemeBuilder,
  defaultThemeData,
  ThemeVarOverwrite,
} from './ThemeBackend'
import EventEmitter from 'wolfy87-eventemitter'
import { callDcMethodAsync } from './ipc'
const { ipcRenderer } = window.electron_functions

function request(url: string): Promise<string> {
  return new Promise((res, rej) => {
    var xhr = new XMLHttpRequest()
    xhr.addEventListener('error', ev => {
      rej(ev)
    })
    xhr.open('GET', url)
    xhr.onload = function() {
      if (xhr.status === 200) {
        res(xhr.responseText)
      } else {
        rej(new Error(`xhr.status: ${xhr.status} != 200`))
      }
    }
    xhr.send()
  })
}

// do we need an event emitter here?
// if yes please replace it by another module and not use the native electron module

export class ThemeManager extends EventEmitter {
  currentTheme: { [key: string]: string }
  currentThemeData: ReturnType<typeof ThemeBuilder>

  constructor() {
    super()
    this.currentTheme = {}
    this.currentThemeData = ThemeBuilder(this.currentTheme)
    window.ThemeManager = this // only for using from the dev console
    ipcRenderer.on('theme-update', _e => this.refresh())
    this.refresh()
  }

  async refresh() {
    const path = await callDcMethodAsync('getThemeFilePath')
    this.setTheme(await this._loadThemeFile(path))
  }

  async _loadThemeFile(theme_file_path: string) {
    return JSON.parse(await request(`file://${theme_file_path}`))
  }

  setTheme(theme: { [key: string]: string }) {
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
    return this.props.children
  }
}
