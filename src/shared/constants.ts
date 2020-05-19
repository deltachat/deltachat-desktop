export const appName = 'DeltaChat'
export const homePageUrl = 'https://delta.chat'
export const gitHubUrl = 'https://github.com/deltachat/deltachat-desktop'
export const gitHubIssuesUrl = gitHubUrl + '/issues'
export const gitHubLicenseUrl = gitHubUrl + '/blob/master/LICENSE'

// we can only convert this to an import when we find out how we can ignore
// "'rootDir' is expected to contain all source files."
// for this line
const { version } = require('../../package.json')

export const appVersion = version

export const appWindowTitle = appName

export const enum Timespans {
  ZERO_SECONDS = 0,
  ONE_HOUR_IN_SECONDS = 60 * 60,
  TWO_HOURS_IN_SECONDS = 60 * 60 * 2,
  ONE_DAY_IN_SECONDS = 60 * 60 * 24,
  ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7,
  FOUR_WEEKS_IN_SECONDS = 60 * 60 * 24 * 7 * 4,
  ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365,
}
