/*
this is a modified version of https://github.com/sindresorhus/electron-context-menu/
with the following license:

MIT License

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*
modifications:
- remove unnessesary functionality
- add use of our translation system
*/

'use strict'
import electron, { BrowserWindow, MenuItemConstructorOptions } from 'electron'
import { todo } from '../shared/shared-types'
import { Event } from 'electron/common'
import { getMessageFunction } from '../shared/localize'
import { ExtendedAppMainProcess } from './types'

const webContents = (win: BrowserWindow) => win.webContents

const removeUnusedMenuItems = (
  menuTemplate: (electron.MenuItemConstructorOptions | electron.MenuItem)[]
) => {
  let notDeletedPreviousElement:
    | electron.MenuItemConstructorOptions
    | electron.MenuItem

  return menuTemplate
    .filter(
      menuItem =>
        menuItem !== undefined &&
        menuItem !== false &&
        menuItem.visible !== false
    )
    .filter((menuItem, index, array) => {
      const toDelete =
        menuItem.type === 'separator' &&
        (!notDeletedPreviousElement ||
          index === array.length - 1 ||
          array[index + 1].type === 'separator')
      notDeletedPreviousElement = toDelete
        ? notDeletedPreviousElement
        : menuItem
      return !toDelete
    })
}

const create = (win: BrowserWindow) => {
  const enableSpellChecking: boolean = false
  const handleContextMenu = (_event: Event, props: todo) => {
    const tx: getMessageFunction = (electron.app as ExtendedAppMainProcess)
      .translate
    const { editFlags } = props
    const hasText = props.selectionText.trim().length > 0
    const can = (type: todo) => editFlags[`can${type}`] && hasText

    const defaultActions: {
      [key: string]: () => MenuItemConstructorOptions
    } = {
      separator: () => ({ type: 'separator' }),
      learnSpelling: () => ({
        id: 'learnSpelling',
        label: tx('menu_learn_spelling'),
        visible: Boolean(props.isEditable && hasText && props.misspelledWord),
        click() {
          const target = webContents(win)
          target.session.addWordToSpellCheckerDictionary(props.misspelledWord)
        },
      }),
      cut: () => ({
        id: 'cut',
        label: tx('global_menu_edit_cut_desktop'),
        enabled: can('Cut'),
        visible: props.isEditable,
        click(_menuItem) {
          const target = webContents(win)
          if (target) {
            target.cut()
          } else {
            electron.clipboard.writeText(props.selectionText)
          }
        },
      }),
      copy: () => ({
        id: 'copy',
        label: tx('global_menu_edit_copy_desktop'),
        enabled: can('Copy'),
        visible: props.isEditable || hasText,
        click() {
          const target = webContents(win)
          if (target) {
            target.copy()
          } else {
            electron.clipboard.writeText(props.selectionText)
          }
        },
      }),
      paste: () => ({
        id: 'paste',
        label: tx('global_menu_edit_paste_desktop'),
        enabled: editFlags.canPaste,
        visible: props.isEditable,
        click() {
          const target = webContents(win)
          target.paste()
        },
      }),
      copyLink: () => ({
        id: 'copyLink',
        label: tx('menu_copy_link_to_clipboard'),
        visible: props.linkURL.length !== 0 && props.mediaType === 'none',
        click() {
          electron.clipboard.write({
            bookmark: props.linkText,
            text: props.linkURL,
          })
        },
      }),
      copyImage: () => ({
        id: 'copyImage',
        label: tx('menu_copy_image_to_clipboard'),
        visible: props.mediaType === 'image',
        click() {
          webContents(win).copyImageAt(props.x, props.y)
        },
      }),
    }

    function word(suggestion: string) {
      return {
        id: 'dictionarySuggestions',
        label: suggestion,
        visible: Boolean(props.isEditable && hasText && props.misspelledWord),
        click(menuItem: MenuItemConstructorOptions) {
          const target = webContents(win)
          target.insertText(menuItem.label)
        },
      }
    }

    let dictionarySuggestions = []
    if (enableSpellChecking) {
      if (
        hasText &&
        props.misspelledWord &&
        props.dictionarySuggestions.length > 0
      ) {
        dictionarySuggestions = props.dictionarySuggestions.map(
          (suggestion: string) => word(suggestion)
        )
      } else {
        dictionarySuggestions.push({
          id: 'dictionarySuggestions',
          label: tx('no_spellcheck_suggestions_found'),
          visible: Boolean(hasText && props.misspelledWord),
          enabled: false,
        })
      }
    }

    let menuTemplate: (
      | electron.MenuItemConstructorOptions
      | electron.MenuItem
    )[] = [
      dictionarySuggestions.length > 0 && defaultActions.separator(),
      ...dictionarySuggestions,
      defaultActions.separator(),
      enableSpellChecking && defaultActions.learnSpelling(),
      defaultActions.separator(),
      defaultActions.cut(),
      defaultActions.copy(),
      defaultActions.paste(),
      defaultActions.separator(),
      defaultActions.copyImage(),
      defaultActions.separator(),
      defaultActions.copyLink(),
      defaultActions.separator(),
    ]

    // Filter out leading/trailing separators
    // TODO: https://github.com/electron/electron/issues/5869
    menuTemplate = removeUnusedMenuItems(menuTemplate)

    if (menuTemplate.length > 0) {
      const menu = (electron.remote
        ? electron.remote.Menu
        : electron.Menu
      ).buildFromTemplate(menuTemplate)

      menu.popup({ window: win })
    }
  }

  webContents(win).on('context-menu', handleContextMenu)

  return () => {
    if (win.isDestroyed()) {
      return
    }

    webContents(win).removeListener('context-menu', handleContextMenu)
  }
}

const ContextMenu = () => {
  let isDisposed = false
  const disposables: (() => void)[] = []

  const init = (win: BrowserWindow) => {
    if (isDisposed) {
      return
    }

    const disposeMenu = create(win)

    disposables.push(disposeMenu)
    const removeDisposable = () => {
      const index = disposables.indexOf(disposeMenu)
      if (index !== -1) {
        disposables.splice(index, 1)
      }
    }

    if (typeof win.once !== 'undefined') {
      // Support for BrowserView
      win.once('closed', removeDisposable)
    }

    disposables.push(() => {
      win.off('closed', removeDisposable)
    })
  }

  const dispose = () => {
    for (const dispose of disposables) {
      dispose()
    }

    disposables.length = 0
    isDisposed = true
  }

  for (const win of (
    electron.BrowserWindow || electron.remote.BrowserWindow
  ).getAllWindows()) {
    init(win)
  }

  const app = electron.app || electron.remote.app

  const onWindowCreated = (_event: todo, win: BrowserWindow) => {
    init(win)
  }

  app.on('browser-window-created', onWindowCreated)
  disposables.push(() => {
    app.removeListener('browser-window-created', onWindowCreated)
  })

  return dispose
}

export default ContextMenu
