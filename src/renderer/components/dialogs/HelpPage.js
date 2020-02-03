import React from 'react'
import reactStringReplace from 'react-string-replace'
import parse from 'html-react-parser'
import domToReact from 'html-react-parser/lib/dom-to-react'
import DeltaDialog, { DeltaDialogContent, DeltaDialogBody } from './DeltaDialog'
import ClickableLink from '../helpers/ClickableLink'
import { join } from 'path'
import fs from 'fs'
import electron from 'electron'

const contentFilePath = join(electron.remote.app.getAppPath(), '/static/help/__locale__/help.html')

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
  const parserOptions = { replace: (node) => {
    if (node.attribs && node.attribs.href && node.attribs.href.startsWith('http')) {
      return (
        <ClickableLink href={node.attribs.href}>{domToReact(node.children, parserOptions)}</ClickableLink>
      )
    } else if (node.attribs && node.attribs.src) {
      node.attribs.src = node.attribs.src.replace('../', './help/')
      return node
    }
  } }
  return parse(helpPageReadContentFile(), parserOptions)
}

export default function HelpPage (props) {
  return (
    <DeltaDialog
      title={window.translate('menu_help')}
      isOpen={props.isOpen}
      onClose={props.onClose}
      fixed
    >
      <DeltaDialogBody noFooter>
        <DeltaDialogContent>
            <span className='help-content'>
              <HelpPageContent />
            </span>
        </DeltaDialogContent>
      </DeltaDialogBody>
    </DeltaDialog>
  )
}
