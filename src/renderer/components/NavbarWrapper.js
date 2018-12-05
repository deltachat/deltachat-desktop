const styled = require('styled-components').default
const StyleVariables = require('./style-variables')

module.exports = styled.div`
  img {
    height: 40px;
    margin-left: 5px;
  }

  .bp3-navbar {
    padding: 0px;
    background-color: ${StyleVariables.colors.deltaPrimaryBg};
    color: ${StyleVariables.colors.deltaPrimaryFg};
  }

  .bp3-navbar-heading {
    margin-left: 5px;
    max-width: 250px;
    overflow-x: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 18px;
    font-weight: bold;
  }

  .bp3-align-left {
    width: 30%;
    padding-left: 2vw;
  }

  .bp3-align-right {
    width: 70%;
    float: none;
  }

  .bp3-popover-wrapper {
    margin-left: auto;
  }

  .bp3-icon > svg:not([fill]) {
    fill: ${StyleVariables.colors.deltaPrimaryFg};
    transform: rotate(90deg);
  }

  .bp3-icon-search {
    margin-left: 0px !important;
  }

  .bp3-input[type="search"] {
    background-color: ${StyleVariables.colors.deltaPrimaryBg};
    -webkit-box-shadow: none;
    box-shadow: none;
    border: unset;
    color: ${StyleVariables.colors.deltaPrimaryFg};
    padding-left: unset !important;
    margin-left: 40px;
    width: calc(100% - 40px);
  }

  .bp3-input[type="search"]::placeholder {
    color: ${StyleVariables.colors.deltaPrimaryFgLight}
  }

  .bp3-button.bp3-minimal {
    min-width: 0px;
    min-height: 0px;
    margin-right: 1vw;
  }
`
