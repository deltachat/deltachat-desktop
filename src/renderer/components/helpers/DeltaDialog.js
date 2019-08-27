import React, { Fragment } from 'react'

export default function DeltaDialog() {
    const { children } = props
    return (
      <Fragment>
        <SettingsDialogGlobal />
        <Dialog
          isOpen={this.props.isOpen}
          onClose={() => this.setState({ userDetails: false })}
          className='SettingsDialog'
        >
          {props.children}
        </Dialog>
      </Fragment>
    )
}
