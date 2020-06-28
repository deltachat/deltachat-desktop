import React, { useContext } from 'react'
import { defaultRules, blockRegex, anyScopeRegex } from 'simple-markdown'
import { Classes } from '@blueprintjs/core'
import { ScreenContext } from '../../contexts'
import { SmallDialog } from '../dialogs/DeltaDialog'
import { OpenDialogFunctionType } from '../dialogs/DialogController'
import { encode, toASCII } from 'punycode'
const { openExternal } = window.electron_functions

var ignoreCapture = function() {
  return {}
}

function assign(rule: any, order: any, object = {}) {
  return Object.assign({}, rule, { order }, object)
}

// function ignoreScope (rule) {
//   return Object.assign(rule, {
//     match: anyScopeRegex(rule.match.regex)
//   })
// }

// function ignoreScopeAssign (rule, order, object = {}) {
//   return ignoreScope(assign(rule, order, object))
// }

export const previewRules: SimpleMarkdown.ParserRules = {
  Array: defaultRules.Array,
  // strong: ignoreScopeAssign(defaultRules.strong, 1), // bold
  // em: ignoreScopeAssign(defaultRules.em, 1), // italics
  // ubold: assign(ignoreScope(defaultRules.u), 2, { react: defaultRules.strong.react }),
  // del: ignoreScopeAssign(defaultRules.del, 3),
  // inlineCode: ignoreScopeAssign(defaultRules.inlineCode, 12),
  text: assign(defaultRules.text, 100),
}
export const rules: SimpleMarkdown.ParserRules = Object.assign(
  {
    // new mailto (open chat in dc?)
    // blockQuote ? (requires css; could be used for replies)
    // mentions? (this component requires somekind of access to the chat memberlist)
    // codeBlock: assign(defaultRules.codeBlock, 11, {
    //   react: function (node, output, state) {
    //     var className = node.lang
    //       ? 'markdown-code markdown-code-' + node.lang
    //       : undefined
    //     // code with syntax highlighting (?)
    //     return <code className={className} key={state.key}>
    //       {node.content}
    //     </code>
    //   }
    // }),
    // fence: assign(defaultRules.fence, 11, {
    //   match: blockRegex(/^ *(`{3,}|~{3,})(\S+)? *\n?([\s\S]+?)\s*\1\n*/)
    // }), // uses style of codeBlock
    labeled_link: {
      order: 18,
      match: anyScopeRegex(
        /^\[([^\]]*)\]\((https?:\/\/[^\s<]+[^<>.,:;"')\]\s])\)/
      ),
      parse: function(
        capture: RegExpMatchArray,
        recurseParse: any,
        state: any
      ) {
        var link = {
          label: capture[1],
          target: capture[2],
        }
        return link
      },
      react: function(node: any, output: any, state: any) {
        return (
          <LabeledLink
            key={state.key}
            target={node.target}
            label={node.label}
          />
        )
      },
    },
    normal_link: {
      order: 18,
      match: anyScopeRegex(/^(https?:\/\/[^\s<]+[^<>.,:;"')\]\s])/),
      parse: function(capture: any[], recurseParse: any, state: any) {
        return { content: capture[1] }
      },
      react: function(node: any, output: any, state: any) {
        const onClick = (ev: any) => {
          ev.preventDefault()
          openExternal(node.content)
        }
        return (
          <a href={node.content} key={state.key} onClick={onClick}>
            {node.content}
          </a>
        )
      },
    },
    newlinePlus: {
      order: 19,
      match: blockRegex(/^(?:\n *){2,}\n/),
      parse: ignoreCapture,
      react: function(node: any, output: any, state: any) {
        return <div key={state.key} className='double-line-break' />
      },
    },
    newline: {
      order: 20,
      match: blockRegex(/^(?:\n *)\n/),
      parse: ignoreCapture,
      react: function(node: any, output: any, state: any) {
        return <div key={state.key} className='line-break' />
      },
    },
  },
  previewRules
)

const LabeledLink = ({ label, target }: { label: string; target: string }) => {
  const { openDialog } = useContext(ScreenContext)
  const splittedTarget = String(target).split('/')
  // encode the punycode to make phishing harder
  splittedTarget[2] = splittedTarget[2]
    .split('.')
    .map(toASCII)
    .join('.')
  const sanitizedTarget = splittedTarget.join('/')
  const onClick = (ev: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    ev.preventDefault()
    ev.stopPropagation()
    ;(openDialog as OpenDialogFunctionType)(({ isOpen, onClose }) => {
      const tx = window.translate

      return (
        <SmallDialog isOpen={isOpen} onClose={onClose}>
          <div className='bp3-dialog-body-with-padding'>
            <p>{tx('open_url_confirmation')}</p>
            <p>{sanitizedTarget}</p>
            <div className={Classes.DIALOG_FOOTER}>
              <div
                className={Classes.DIALOG_FOOTER_ACTIONS}
                style={{ justifyContent: 'space-between', marginTop: '7px' }}
              >
                <p
                  className={`delta-button no-padding bold primary`}
                  onClick={onClose}
                >
                  {tx('no')}
                </p>
                <p
                  className={`delta-button no-padding bold ${'primary'}`}
                  onClick={() => {
                    onClose()
                    openExternal(target)
                  }}
                >
                  {tx('yes')}
                </p>
              </div>
            </div>
          </div>
        </SmallDialog>
      )
    })
  }
  return (
    <a href={'#' + target} title={sanitizedTarget} onClick={onClick}>
      {String(label)}
    </a>
  )
}
