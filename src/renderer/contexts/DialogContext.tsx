import React, { Fragment, useCallback, useMemo, useState } from 'react'

import type { JSXElementConstructor, PropsWithChildren } from 'react'

type DialogId = number

export type DialogProps = {
  isOpen: boolean
  onClose: () => void
}

type DialogElementConstructor<T> = JSXElementConstructor<DialogProps & T>

type OpenDialog = <T extends { [key: string]: any }>(
  dialogElement: DialogElementConstructor<T>,
  additionalProps?: T
) => DialogId

type CloseDialog = (id: DialogId) => void

type DialogContextValue = {
  hasOpenDialogs: boolean
  openDialog: OpenDialog
  closeDialog: CloseDialog
}

const INITIAL_DIALOG_ID: DialogId = 1

const initialValues: DialogContextValue = {
  hasOpenDialogs: false,
  openDialog: _ => 1,
  closeDialog: _ => {},
}

export const DialogContext = React.createContext<DialogContextValue>(
  initialValues
)

export const DialogContextProvider = ({ children }: PropsWithChildren<{}>) => {
  const [nextId, setNextId] = useState<DialogId>(INITIAL_DIALOG_ID)
  const [dialogs, setDialogs] = useState<{ [id: DialogId]: JSX.Element }>({})

  const getNextId = useCallback(() => {
    const newId = nextId
    setNextId(id => id + 1)
    return newId
  }, [nextId])

  const closeDialog = useCallback(
    (id: DialogId) => {
      const { [id]: _, ...rest } = dialogs
      setDialogs(rest)
    },
    [dialogs]
  )

  const openDialog = useCallback<OpenDialog>(
    (dialogElement, additionalProps) => {
      const newDialogId = getNextId()

      // From this point on we are only interested in the `DialogProps`
      const Dialog = dialogElement as DialogElementConstructor<DialogProps>

      const newDialog = (
        <Dialog
          isOpen
          onClose={() => closeDialog(newDialogId)}
          {...additionalProps}
        />
      )

      setDialogs({
        ...dialogs,
        [newDialogId]: newDialog,
      })

      return newDialogId
    },
    [closeDialog, dialogs, getNextId]
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
        return <Fragment key={`dialog-${id}`}>{dialogs[parseInt(id)]}</Fragment>
      })}
    </DialogContext.Provider>
  )
}
