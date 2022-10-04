import SplitOut from './splitout'
export default class DCLocations extends SplitOut {
  getLocations(
    chatId: number,
    contactId: number,
    timestampFrom: number,
    timestampTo: number
  ) {
    return this.selectedAccountContext.getLocations(
      chatId,
      contactId,
      timestampFrom,
      timestampTo
    )
  }
}
