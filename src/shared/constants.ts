import { C } from 'deltachat-node/node/dist/constants'

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
  NEVER = Timespans.ZERO_SECONDS,
  AT_ONCE = Timespans.ONE_SECOND,
  THIRTY_SECONDS = Timespans.THIRTY_SECONDS,
  ONE_MINUTE = Timespans.ONE_MINUTE_IN_SECONDS,
  ONE_HOUR = Timespans.ONE_HOUR_IN_SECONDS,
  ONE_DAY = Timespans.ONE_DAY_IN_SECONDS,
  ONE_WEEK = Timespans.ONE_WEEK_IN_SECONDS,
  FOUR_WEEKS = Timespans.FOUR_WEEKS_IN_SECONDS,
  ONE_YEAR = Timespans.ONE_YEAR_IN_SECONDS,
}

export const DAYS_UNTIL_UPDATE_SUGGESTION = 120

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
  QrWithdrawVerifyContact = C.DC_QR_WITHDRAW_VERIFYCONTACT,
  /** text1=groupname */
  QrWithdrawVerifyGroup = C.DC_QR_WITHDRAW_VERIFYGROUP,
  QrReviveVerifyContact = C.DC_QR_REVIVE_VERIFYCONTACT,
  /** text1=groupname */
  QrReviveVerifyGroup = C.DC_QR_REVIVE_VERIFYGROUP,
}

// cloned, because we cannpt import it from dc node in the frontend directly,
// without esbuild trying to include dc-node in the build and failing
// because it can not bundle the nodejs-only dependencies of deltachat node.
export enum MessageDownloadState {
  Available = C.DC_DOWNLOAD_AVAILABLE,
  Done = C.DC_DOWNLOAD_DONE,
  Failure = C.DC_DOWNLOAD_FAILURE,
  InProgress = C.DC_DOWNLOAD_IN_PROGRESS,
}

export const MEDIA_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'apng',
  'gif',
  'mkv',
  'avi',
  'mp4',
]
