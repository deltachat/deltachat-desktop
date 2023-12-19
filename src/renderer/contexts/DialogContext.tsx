import React, { createElement, useCallback, useMemo, useState } from 'react'

import type { JSXElementConstructor, PropsWithChildren } from 'react'

import { generateRandomUUID } from '../utils/random'

type DialogId = string

export type DialogProps = {
  onClose: () => void
}

type DialogElementConstructor<T> = JSXElementConstructor<DialogProps & T>

export type OpenDialog = <T extends { [key: string]: any }>(
  dialogElement: DialogElementConstructor<T>,
  additionalProps?: T
) => DialogId

export type CloseDialog = (id: DialogId) => void

type DialogContextValue = {
  hasOpenDialogs: boolean
  openDialog: OpenDialog
  closeDialog: CloseDialog
}

const initialValues: DialogContextValue = {
  hasOpenDialogs: false,
  openDialog: _ => '',
  closeDialog: _ => {},
}

export const DialogContext =
  React.createContext<DialogContextValue>(initialValues)

export const DialogContextProvider = ({ children }: PropsWithChildren<{}>) => {
  const [dialogs, setDialogs] = useState<{ [id: DialogId]: JSX.Element }>({})

  const closeDialog = useCallback((id: DialogId) => {
    setDialogs(({ [id]: _, ...rest }) => rest)
  }, [])

  const openDialog = useCallback<OpenDialog>(
    (dialogElement, additionalProps) => {
      const newDialogId = generateRandomUUID()

      const newDialog = createElement(
        // From this point on we are only interested in the `DialogProps`
        dialogElement as DialogElementConstructor<DialogProps>,
        {
          key: `dialog-${newDialogId}`,
          onClose: () => {
            closeDialog(newDialogId)
          },
          ...additionalProps,
        }
      )

      setDialogs(dialogs => {
        return {
          ...dialogs,
          [newDialogId]: newDialog,
        }
      })

      return newDialogId
    },
    [closeDialog]
  )

  const hasOpenDialogs = useMemo(() => {
    return Object.keys(dialogs).length > 0
  }, [dialogs])

  const value = {
    hasOpenDialogs,
    openDialog,
    closeDialog,
  }

  return (
    <DialogContext.Provider value={value}>
      {children}
      {Object.keys(dialogs).map(id => {
        return dialogs[id]
      })}
    </DialogContext.Provider>
  )
}
