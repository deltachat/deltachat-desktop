import React from 'react'
import reactStringReplace from 'react-string-replace'
import parse from 'html-react-parser'
import domToReact from 'html-react-parser/lib/dom-to-react'
import DeltaDialog, { DeltaDialogBody, DeltaDialogFooter } from './DeltaDialog'
import { Card } from '@blueprintjs/core'
import ClickableLink from '../helpers/ClickableLink'
import { join } from 'path'
import fs from 'fs'

const contentFilePath = join(__dirname, `../../../../static/help/__locale__/help.html`)

function helpPageReadContentFile () {
  const locale = window.localeData.locale
  let contentFile = contentFilePath.replace('__locale__', locale)
  if (!fs.existsSync(contentFile)) {
    if (locale !== 'en') {
      contentFile = contentFilePath.replace('__locale__', 'en')
    } else {
      throw new Error(`Cannot read HTML content, file not found: '${contentFile}'`)
    }
  }
  return fs.readFileSync(contentFile, 'utf-8')
}

export function HelpPageContent ({ props }) {
  // Make links open externaly (without this, nothing happens if one clicks on a link).
  const parserOptions = { replace: ({ attribs, children }) => {
    if (attribs && attribs.href && attribs.href.startsWith('http')) {
      return (
        <ClickableLink href={attribs.href}>{domToReact(children, parserOptions)}</ClickableLink>
      )
    }
  } }
  return parse(helpPageReadContentFile(), parserOptions)
}

function HelpPageLocalCopyHint ({ props }) {
  const locale = window.localeData.locale
  const localizedHref = `https://delta.chat/${locale}/help`
  const text = window.translate('help_page_local_copy_hint')
  const linkedText = reactStringReplace(text, /\[LINK:([^\]]+)\]/, (match, index) => (
    <ClickableLink href={localizedHref} key={index}>{match}</ClickableLink>
  ))

  return (
    <p className='help-page-local-copy-hint'>
      {linkedText}
    </p>
  )
}

export default function HelpPage (props) {
  return (
    <DeltaDialog
      title={window.translate('menu_help')}
      isOpen={props.isOpen}
      onClose={props.onClose}
    >
      <DeltaDialogBody>
        <Card>
          <span className='help-content'>
            <HelpPageContent />
          </span>
        </Card>
      </DeltaDialogBody>
      <DeltaDialogFooter>
        <HelpPageLocalCopyHint />
      </DeltaDialogFooter>
    </DeltaDialog>
  )
}
