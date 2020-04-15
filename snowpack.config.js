const rollupPluginNodePolyfills = require('rollup-plugin-node-polyfills')

module.exports =  {
  "webDependencies": [
    "react",
    "react-dom",
    "styled-components",
    "react-intl",
    "moment",
    "color",
    "@blueprintjs/core",
    "immutability-helper",
    "classnames",
    "use-debounce",
    "react-string-replace",
    "array-differ",
    "react-qr-svg",
    "react-contextmenu",
    "debounce",
    "mime-types",
    "simple-markdown",
    "mapbox-gl",
    "@mapbox/geojson-extent",
    "emoji-mart",
    "emoji-js-clean",
    "colors",
    "colors/safe.js",
    "error-stack-parser",
    "deltachat-node/dist/constants.js"
  ],
  "installOptions": {
    "dest": "./dist/frontend/js/web_modules"
  },
  "rollup": {
      "plugins": [rollupPluginNodePolyfills()]
  }
}
