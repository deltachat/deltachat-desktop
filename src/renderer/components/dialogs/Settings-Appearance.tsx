import { SettingsContext, ScreenContext } from "../../contexts"
import React, { useContext, useEffect, useState } from "react"
import { H5, HTMLSelect, RadioGroup, Radio } from "@blueprintjs/core"
import { DeltaBackend } from "../../delta-remote"
import { ThemeManager } from "../../ThemeManager"
import { SmallDialog, DeltaDialogHeader, DeltaDialogBody, DeltaDialogContent, DeltaDialogFooter } from "./DeltaDialog"
import DialogController, { DialogProps } from "./DialogController"
import { AutodeleteTimeDurations } from "./Settings-Autodelete"
import { AutodeleteDuration } from "../../../shared/constants"
import ScreenController from "../../ScreenController"
import { SettingsSelector } from "./Settings"

export function SmallSelectDialog(
    {selectedValue, values, onSave, title, isOpen, onClose} :
    {
        title: string,
        selectedValue: string,
        values: [string, string][],
        onSave: (selectedValue: string) => void
        isOpen: DialogProps['isOpen']
        onClose: DialogProps['onClose']
    })
{
    const [actualSelectedValue, setActualSelectedValue] = useState<string>(selectedValue)

    const onChange = (event: React.FormEvent<HTMLInputElement>) => {
        const actualSelectedValue: string = String(event.currentTarget.value)
        setActualSelectedValue(actualSelectedValue)
    }
    const saveAndClose = () => {
        onSave(actualSelectedValue)
        onClose()
    }

    const tx = window.translate
    return (
    <SmallDialog isOpen={isOpen} onClose={onClose}>
      <DeltaDialogHeader title={title} />
      <DeltaDialogBody>
        <DeltaDialogContent>
            <RadioGroup onChange={onChange} selectedValue={actualSelectedValue}>
                {values.map((element, index) => {
                    const [value, label] = element
                    return (
                        <Radio
                            key={'select-' + index}
                            label={label}
                            value={value}
                        />  
                    )
                })}
            </RadioGroup>
        </DeltaDialogContent>
      </DeltaDialogBody>
      <DeltaDialogFooter
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0px',
          padding: '7px 13px 10px 13px',
        }}
      >
        <p className='delta-button danger bold' onClick={onClose}>
          {tx('cancel')}
        </p>
        <p className='delta-button primary bold' onClick={saveAndClose}>
          {tx('save_desktop')}
        </p>
      </DeltaDialogFooter>
    </SmallDialog>
    )
}

export default function SettingsAppearance({forceUpdate}:{forceUpdate: any}) {
    const { activeTheme } = useContext(SettingsContext)
    const { openDialog } = useContext(ScreenContext)
    
    const [availableThemes, setAvailableThemes] = useState<{[key: string]: any}[]>([])
    useEffect(() => {
        (async () => {
            const availableThemes = await DeltaBackend.call('extras.getAvailableThemes')
            setAvailableThemes(availableThemes)
        })()
    }, [])

    const onSave = async (theme:string) => {
        await DeltaBackend.call('extras.setTheme', theme)
        await ThemeManager.refresh()
        forceUpdate()
    }
    
    const onOpenSelectThemeDialog = async () => {
        const label = 'Theme'
        let values = [
            ['system', tx('automatic')],
            ...availableThemes.map(({address, name} : {address: string, name: string}) => {
              return [address, name]
            })
        ]
    
        openDialog(SmallSelectDialog, {
          values,
          selectedValue: activeTheme,
          title: tx('pref_theme'),
          onSave
        })
      }

    const shortCurrentValue = () => {
        if (activeTheme === 'system') {
            return  tx('automatic')
        }
        const theme = availableThemes.find(({address}:{address: string}) => address === activeTheme )
        if(!theme) return 'Loading...'

        return theme.name
    }

    const tx = window.translate
    return (
          <div>
            <H5>{tx('pref_appearance')}</H5>
            <SettingsSelector
                onClick={onOpenSelectThemeDialog}
                currentValue={shortCurrentValue()}
            >
                {tx('pref_theme')}
            </SettingsSelector>
          </div>
    )
  }