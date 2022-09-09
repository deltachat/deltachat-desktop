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
