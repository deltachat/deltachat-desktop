import React from 'react'
import { LabeledLink, Link } from './Link'
import { parse, ParsedElement } from '@deltachat/message_parser_wasm/message_parser_wasm'
import { getLogger } from '../../../shared/logger'

const log = getLogger('renderer/message-markdown')

const parseMessage: (message: string) => ParsedElement[] = parse

function renderElement(elm: ParsedElement, key?: number): JSX.Element {
  switch (elm.t) {
    case 'CodeBlock':
      return (
        <code className={'mm-code mm-code-' + elm.c.language} key={key}>
          {elm.c.language && <span>{elm.c.language}</span>}
          {elm.c.content}
        </code>
      )

    case 'InlineCode':
      return (
        <code className='mm-inline-code' key={key}>
          {elm.c.content}
        </code>
      )

    case 'StrikeThrough':
      return <s key={key}>{elm.c.map(renderElement)}</s>

    case 'Italics':
      return <i key={key}>{elm.c.map(renderElement)}</i>

    case 'Bold':
      return <b key={key}>{elm.c.map(renderElement)}</b>

    case 'Tag':
      return (
        <a
          key={key}
          href={'#'}
          onClick={() =>
            log.info(
              `Clicked on a hastag, this should open search for the text "${
                '#' + elm.c
              }"`
            )
          }
        >
          {'#' + elm.c}
        </a>
      )

    case 'Link': {
      const { destination } = elm.c
      return <Link target={destination} key={key} />
    }

    case 'LabeledLink':
      return (
        <>
          <LabeledLink
            key={key}
            target={elm.c.destination}
            label={<>{elm.c.label.map(renderElement)}</>}
          />{' '}
        </>
      )

    case 'EmailAddress': {
      const email = elm.c
      return (
        <a
          key={key}
          href={'#'}
          onClick={() => log.info('email clicked', email)}
        >
          {email}
        </a>
      )
    }

    case 'Linebreak':
      return <div key={key} className='line-break' />

    case 'Text':
      return <>{elm.c}</>

    default:
      //@ts-ignore
      log.error(`type ${elm.t} not known/implemented yet`, elm)
      return <span style={{ color: 'red' }}>{JSON.stringify(elm)}</span>
  }
}

export function message2React(message: string): JSX.Element {
  const elements = parseMessage(message)
  return <>{elements.map(renderElement)}</>
}

// newlinePlus: {
//   order: 19,
//   match: blockRegex(/^(?:\n *){2,}\n/),
//   parse: ignoreCapture,
//   react: function (_node: any, _output: any, state: any) {
//     return <div key={state.key} className='double-line-break' />
//   },
// },
