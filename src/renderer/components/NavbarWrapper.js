const styled = require('styled-components').default

module.exports = styled.div`
  .bp3-navbar {
    padding: 0px;
    background-color: ${props => props.theme.navBarBackground};
    color: ${props => props.theme.navBarText};
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
    padding: 0px 10px;
  }

  .bp3-align-right {
    width: 70%;
    float: none;
  }

  .bp3-popover-wrapper {
    margin-left: auto;
  }

  .bp3-icon > svg:not([fill]) {
    fill: ${props => props.theme.navBarText};
  }

  .icon-rotated > .bp3-icon > svg:not([fill]){
    transform: rotate(90deg);
  }

  .bp3-icon-search {
    margin-left: 0px !important;
  }

  input {
    background-color: ${props => props.theme.navBarBackground};
    -webkit-box-shadow: none;
    box-shadow: none;
    border: unset;
    color: ${props => props.theme.navBarText};
    padding-left: unset !important;
    margin-left: 40px;
    width: calc(100% - 40px);
  }

  input::placeholder {
    color: ${props => props.theme.navBarSearchPlaceholder}
  }

  .bp3-button.bp3-minimal {
    min-width: 0px;
    min-height: 0px;
  }

  .bp3-popover-target {
    margin-right: 1vw;
  }
`
