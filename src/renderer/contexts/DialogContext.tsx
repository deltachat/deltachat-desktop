import React, { Fragment, useCallback, useMemo, useState } from 'react'

import type { JSXElementConstructor, PropsWithChildren } from 'react'

type DialogId = number

export type DialogProps = {
  isOpen: boolean
  onClose: () => void
}

type DialogElementConstructor<T> = JSXElementConstructor<DialogProps & T>

type OpenDialog = <T extends { [key: string]: any }>(
  DialogElement: DialogElementConstructor<T>,
  additionalProps?: T
) => DialogId

type CloseDialog = (id: DialogId) => void

type DialogContextValue = {
  hasOpenDialogs: boolean
  openDialog: OpenDialog
  closeDialog: CloseDialog
}

const initialValues: DialogContextValue = {
  hasOpenDialogs: false,
  openDialog: _ => 1,
  closeDialog: _ => {},
}

export const DialogContext = React.createContext<DialogContextValue>(
  initialValues
)

export const DialogContextProvider = ({ children }: PropsWithChildren<{}>) => {
  const [nextId, setNextId] = useState<DialogId>(1)
  const [dialogs, setDialogs] = useState<{ [id: DialogId]: JSX.Element }>({})

  const closeDialog = useCallback(
    (id: DialogId) => {
      const { [id]: _, ...rest } = dialogs
      setDialogs(rest)
    },
    [dialogs]
  )

  const openDialog = useCallback<OpenDialog>(
    (DialogElement, additionalProps) => {
      const newDialogId = nextId
      setNextId(id => id + 1)

      const Dialog = DialogElement as JSXElementConstructor<DialogProps>

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
    [closeDialog, dialogs, nextId]
  )

  const state = useMemo(() => {
    const hasOpenDialogs = Object.keys(dialogs).length > 0

    return {
      hasOpenDialogs,
      openDialog,
      closeDialog,
    }
  }, [dialogs, openDialog, closeDialog])

  return (
    <DialogContext.Provider value={state}>
      {children}
      <Fragment>
        {Object.keys(dialogs).map(id => {
          return <div key={`dialog-${id}`}>{dialogs[parseInt(id)]}</div>
        })}
      </Fragment>
    </DialogContext.Provider>
  )
}
