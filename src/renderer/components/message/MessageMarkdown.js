const React = require('react')
const { defaultRules, blockRegex, anyScopeRegex } = require('simple-markdown')
const { remote } = require('electron')

var ignoreCapture = function () { return {} }

function assign (rule, order, object = {}) {
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

const previewRules = {
  Array: defaultRules.Array,
  // strong: ignoreScopeAssign(defaultRules.strong, 1), // bold
  // em: ignoreScopeAssign(defaultRules.em, 1), // italics
  // ubold: assign(ignoreScope(defaultRules.u), 2, { react: defaultRules.strong.react }),
  // del: ignoreScopeAssign(defaultRules.del, 3),
  // inlineCode: ignoreScopeAssign(defaultRules.inlineCode, 12),
  text: assign(defaultRules.text, 100)
}
const rules = Object.assign({
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
  link: {
    order: 18,
    match: anyScopeRegex(/^(https?:\/\/[^\s<]+[^<>.,:;"')\]\s])/),
    parse: function (capture, recurseParse, state) {
      return { content: capture[1] }
    },
    react: function (node, output, state) {
      const onClick = (ev) => {
        ev.preventDefault()
        remote.shell.openExternal(node.content)
      }
      return <a href={node.content} key={state.key} onClick={onClick}>{node.content}</a>
    }
  },
  newlinePlus: {
    order: 19,
    match: blockRegex(/^(?:\n *){2,}\n/),
    parse: ignoreCapture,
    react: function (node, output, state) { return <div key={state.key} className='double-line-break' /> }
  },
  newline: {
    order: 20,
    match: blockRegex(/^(?:\n *)\n/),
    parse: ignoreCapture,
    react: function (node, output, state) { return <div key={state.key} className='line-break' /> }
  }
}, previewRules)

module.exports = {
  previewRules,
  rules
}
