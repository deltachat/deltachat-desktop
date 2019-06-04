const React = require('react')
const { defaultRules, blockRegex } = require('simple-markdown')

var ignoreCapture = function () { return {} }

function assign (rule, order) {
  return Object.assign({}, rule, { order })
}

const previewRules = {
  Array: defaultRules.Array,
  strong: assign(defaultRules.strong, 1),
  em: assign(defaultRules.em, 1),
  u: assign(defaultRules.u, 2),
  del: assign(defaultRules.del, 3),
  br: assign(defaultRules.br, 4),
  text: assign(defaultRules.text, 100)
}
const rules = Object.assign({
  newline: {
    order: 11,
    match: blockRegex(/\n/),
    parse: ignoreCapture,
    react: function (node, output, state) { return <br key={state.key} /> }
  },
  link: {
    order: 12,
    match: defaultRules.url.match,
    parse: function (capture, recurseParse, state) {
      return { content: capture[1] }
    },
    react: function (node, output, state) {
      return <a href={node.content} key={state.key}>{node.content}</a>
    }
  }
  // new mailto (open chat in dc?)
  // blockQuote ? (requires css; could be used for replies)
  // mentions? (this component requires somekind of access to the chat memberlist)
  // code (requires good css to look right - idea is to provide somthing without markdown formating)
  // code with syntax highlighting (?)
}, previewRules)

module.exports = {
  previewRules,
  rules
}
