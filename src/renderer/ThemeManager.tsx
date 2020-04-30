import React, { useEffect, useLayoutEffect, useState, useRef } from 'react'
import {
  ThemeDataBuilder as ThemeBuilder,
  getDefaultTheme,
  ThemeVarOverwrite
} from './ThemeBackend'
import EventEmitter from 'wolfy87-eventemitter'
const { ipcRenderer } = window.electron_functions
import { ipcBackend } from './ipc'

// do we need an event emitter here?
// if yes please replace it by another module and not use the native electron module

export class ThemeManager extends EventEmitter {
  currentTheme: { [key: string]: string }
  currentThemeData: ReturnType<typeof ThemeBuilder>
  defaultTheme: { [key: string]: string }
  defaultThemeData: ReturnType<typeof ThemeBuilder>

  constructor() {
    super()
  }

  async setup() {
    const themeJSON = window.localStorage.getItem('theme')
    this.defaultTheme = await getDefaultTheme()
    this.defaultThemeData = ThemeBuilder(this.defaultTheme)
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
    return Object.assign({}, this.defaultThemeData, this.currentThemeData)
  }

  getCurrentlyAppliedTheme() {
    return Object.assign({}, this.defaultTheme, this.currentTheme)
  }

  getCurrentTheme() {
    return this.currentTheme
  }

  getDefaultThemeData() {
    return this.defaultThemeData
  }

  getDefaultTheme() {
    return this.defaultTheme
  }
}

export function ThemeProvider(props: any) {
  const manager = useRef(null)
  const [theme, setTheme] = useState(false)

  const update = () => {
    const theme = manager.current.getCurrentlyAppliedThemeData()
    setTheme(theme)
    window.document.getElementById('theme-vars').innerText = ThemeVarOverwrite(
      manager.current.getDefaultThemeData(),
      theme
    )
  }

  useEffect(() => {
    (async () => {
      manager.current = new ThemeManager()
      await manager.current.setup()
      manager.current.addListener('update', update)
      update()
    })()
    return () => {
      if(manager.current) manager.current.removeListener('update', update)
    }
  }, [])

  return props.children
}