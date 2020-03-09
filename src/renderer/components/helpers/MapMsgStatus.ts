const { C } = require('deltachat-node/dist/constants')

function mapCoreMsgStatus2String(state: number) {
  switch (state) {
    case C.DC_STATE_OUT_FAILED:
      return 'error'
    case C.DC_STATE_OUT_PENDING:
      return 'sending'
    case C.DC_STATE_OUT_PREPARING:
      return 'sending'
    case C.DC_STATE_OUT_DRAFT:
      return 'draft'
    case C.DC_STATE_OUT_DELIVERED:
      return 'delivered'
    case C.DC_STATE_OUT_MDN_RCVD:
      return 'read'
    case C.DC_STATE_IN_FRESH:
      return 'delivered'
    case C.DC_STATE_IN_SEEN:
      return 'delivered'
    case C.DC_STATE_IN_NOTICED:
      return 'read'
    default:
      return '' // to display no icon on unknown state
  }
}

module.exports = mapCoreMsgStatus2String
