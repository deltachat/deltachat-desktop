const React = require('react')
const { defaultRules, blockRegex, anyScopeRegex } = require('simple-markdown')

var ignoreCapture = function () { return {} }

function assign (rule, order, object = {}) {
  return Object.assign({}, rule, { order }, object)
}

const previewRules = {
  Array: defaultRules.Array,
  strong: assign(defaultRules.strong, 1),
  em: assign(defaultRules.em, 1),
  u: assign(defaultRules.u, 2),
  del: assign(defaultRules.del, 3),
  br: assign(defaultRules.br, 4),
  inlineCode: assign(defaultRules.inlineCode, 12, {
    match: anyScopeRegex(/^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/)
  }),
  text: assign(defaultRules.text, 100)
}
const rules = Object.assign({
  // new mailto (open chat in dc?)
  // blockQuote ? (requires css; could be used for replies)
  // mentions? (this component requires somekind of access to the chat memberlist)
  codeBlock: assign(defaultRules.codeBlock, 11, {
    react: function (node, output, state) {
      var className = node.lang
        ? 'markdown-code markdown-code-' + node.lang
        : undefined
      // code with syntax highlighting (?)
      return <code className={className} key={state.key}>
        {node.content}
      </code>
    }
  }),
  fence: assign(defaultRules.fence, 11, {
    match: blockRegex(/^ *(`{3,}|~{3,})(\S+)? *\n?([\s\S]+?)\s*\1\n*/)
  }), // uses style of codeBlock
  link: {
    order: 18,
    match: defaultRules.url.match,
    parse: function (capture, recurseParse, state) {
      return { content: capture[1] }
    },
    react: function (node, output, state) {
      return <a href={node.content} key={state.key}>{node.content}</a>
    }
  },
  newline: {
    order: 19,
    match: blockRegex(/^(?:\n *)*\n/),
    parse: ignoreCapture,
    react: function (node, output, state) { return <br key={state.key} /> }
  }
}, previewRules)

module.exports = {
  previewRules,
  rules
}
