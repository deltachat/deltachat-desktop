import { C } from 'deltachat-node'

export const appName = 'DeltaChat'
export const homePageUrl = 'https://delta.chat'
export const gitHubUrl = 'https://github.com/deltachat/deltachat-desktop'
export const gitHubIssuesUrl = gitHubUrl + '/issues'
export const gitHubLicenseUrl = gitHubUrl + '/blob/master/LICENSE'

export const appWindowTitle = appName

export const enum Timespans {
  ZERO_SECONDS = 0,
  ONE_SECOND = 1,
  THIRTY_SECONDS = 30,
  ONE_MINUTE_IN_SECONDS = 60,
  ONE_HOUR_IN_SECONDS = 60 * 60,
  TWO_HOURS_IN_SECONDS = 60 * 60 * 2,
  ONE_DAY_IN_SECONDS = 60 * 60 * 24,
  ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7,
  FOUR_WEEKS_IN_SECONDS = 60 * 60 * 24 * 7 * 4,
  ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365,
}

export const enum MuteDuration {
  OFF = Timespans.ZERO_SECONDS,
  ONE_HOUR = Timespans.ONE_HOUR_IN_SECONDS,
  TWO_HOURS = Timespans.TWO_HOURS_IN_SECONDS,
  ONE_DAY = Timespans.ONE_DAY_IN_SECONDS,
  SEVEN_DAYS = Timespans.ONE_WEEK_IN_SECONDS,
  FOREVER = -1,
}

export const enum AutodeleteDuration {
  OFF = Timespans.ZERO_SECONDS,
  ONE_HOUR = Timespans.ONE_HOUR_IN_SECONDS,
  ONE_DAY = Timespans.ONE_DAY_IN_SECONDS,
  ONE_WEEK = Timespans.ONE_WEEK_IN_SECONDS,
  FOUR_WEEKS = Timespans.FOUR_WEEKS_IN_SECONDS,
  ONE_YEAR = Timespans.ONE_YEAR_IN_SECONDS,
}

export const DAYS_UNTIL_UPDATE_SUGGESTION = 90

export enum QrState {
  AskVerifyContact = C.DC_QR_ASK_VERIFYCONTACT,
  AskVerifyGroup = C.DC_QR_ASK_VERIFYGROUP,
  FprOk = C.DC_QR_FPR_OK,
  FprMissmatch = C.DC_QR_FPR_MISMATCH,
  QrFprWithoutAddr = C.DC_QR_FPR_WITHOUT_ADDR,
  Account = C.DC_QR_ACCOUNT,
  Addr = C.DC_QR_ADDR,
  Text = C.DC_QR_TEXT,
  Url = C.DC_QR_URL,
  Error = C.DC_QR_ERROR,
}
