/**
 * Calls run in a separate Electron window (calls-webapp)
 *
 * Uses two app instances, each with its own profile on the chatmail
 * relay from DC_CHATMAIL_DOMAIN, which can also be a local one.
 * Camera and microphone are faked by Chromium.
 */
import { test, expect, type Page } from '@playwright/test'

import { DeltaChatElectron, attachLogsOnFailure } from '../electron-helper.js'
import {
  clickThroughTestIds,
  createNewProfile,
  getChat,
  selectChat,
  type User,
} from '../playwright-helper.js'

/** CI runs tests with this tag separately, see .github/workflows/e2e-electron.yml */
const RELAY = '@relay'

test.describe.configure({ mode: 'serial' })
test.setTimeout(3 * 60_000)

let alice: DeltaChatElectron
let bob: DeltaChatElectron
let aliceUser: User
let bobUser: User

async function onboard(dc: DeltaChatElectron, name: string) {
  return createNewProfile(dc.mainWindow, name, true, true, text =>
    dc.setClipboard(text)
  )
}

test.beforeAll(async () => {
  test.setTimeout(3 * 60_000)
  ;[alice, bob] = await Promise.all([
    DeltaChatElectron.launch({ name: 'alice' }),
    // Bob shares his screen, which must go through the app's
    // display media request handler.
    DeltaChatElectron.launch({ name: 'bob', fakeMediaUi: false }),
  ])
  // Not in parallel: onboarding goes through the system clipboard, which
  // both instances share. On a local relay each profile has its own
  // `dclogin:` link, so both could end up with the same account.
  aliceUser = await onboard(alice, 'Alice')
  bobUser = await onboard(bob, 'Bob')

  await clickThroughTestIds(alice.mainWindow, [
    'qr-scan-button',
    'copy-qr-code',
    'confirm-qr-code',
  ])
  await bob.setClipboard(await alice.readClipboard())
  await clickThroughTestIds(bob.mainWindow, [
    'qr-scan-button',
    'show-qr-scan',
    'paste',
  ])
  await bob.mainWindow
    .getByTestId('confirm-start-chat')
    .getByTestId('confirm')
    .click()
  await expect(getChat(bob.mainWindow, aliceUser.name)).toBeVisible()
  await expect(getChat(alice.mainWindow, bobUser.name)).toBeVisible({
    timeout: 60_000,
  })
})

test.afterEach(() => attachLogsOnFailure(alice, bob))

test.afterAll(async () => {
  await attachLogsOnFailure(alice, bob)
  await Promise.all([alice?.close(), bob?.close()])
})

let bobCall: Page
let aliceCall: Page

/**
 * Checks that there is an `<audio>` element that has a
 * live track and its playback position advances.
 */
async function isReceivingAudio(callWindow: Page): Promise<boolean> {
  const position = () =>
    callWindow.evaluate(() => {
      const audio = document.querySelector('audio')
      const stream = audio?.srcObject as MediaStream | null | undefined
      const live = stream
        ?.getAudioTracks()
        .some(track => track.readyState === 'live')
      return audio && live && !audio.paused ? audio.currentTime : null
    })
  const before = await position()
  await callWindow.waitForTimeout(500)
  const after = await position()
  return before !== null && after !== null && after > before
}

test('outgoing call rings on the other instance', { tag: RELAY }, async () => {
  const page = bob.mainWindow
  await selectChat(page, aliceUser.name)
  await page.getByRole('button', { name: 'Call', exact: true }).click()
  await page.getByRole('menuitem', { name: 'Audio Call' }).click()

  bobCall = await bob.callWindow()
  await expect(bobCall.getByRole('status').first()).toContainText('Ringing')

  aliceCall = await alice.callWindow({ timeout: 60_000 })
  await expect(aliceCall.getByRole('status').first()).toContainText(
    'Incoming call'
  )
})

test('answering connects both parties with audio', { tag: RELAY }, async () => {
  expect(await isReceivingAudio(aliceCall)).toBe(false)

  // The button pulses, so Playwright never considers it "stable" for click(),
  // but pressing 'Enter' works reliably to activate the button.
  await aliceCall.getByRole('button', { name: 'Answer call' }).press('Enter')

  for (const callWindow of [aliceCall, bobCall]) {
    await expect(
      callWindow.getByRole('button', { name: 'Answer call' })
    ).toHaveCount(0)
    await expect.poll(() => isReceivingAudio(callWindow)).toBe(true)
  }
})

/**
 * Whether the remote video (not the local preview thumbnail)
 * is shown and its playback position advances.
 */
async function isShowingRemoteVideo(callWindow: Page): Promise<boolean> {
  const position = () =>
    callWindow.evaluate(() => {
      // The first one is the remote video, the second one the local preview.
      const video = document.querySelector('video')
      if (video == null || video.checkVisibility() === false) {
        return null
      }
      return video.videoWidth > 0 && !video.paused ? video.currentTime : null
    })
  const before = await position()
  await callWindow.waitForTimeout(500)
  const after = await position()
  return before !== null && after !== null && after > before
}

test(
  'sharing the screen shows it to the other party',
  { tag: RELAY },
  async () => {
    // This is an audio call, so there is no video initially.
    expect(await isShowingRemoteVideo(aliceCall)).toBe(false)

    // The real sources would make the xdg-desktop-portal show its picker
    // on Wayland. `screen:-3:0` is Chromium's fake screen, which works with
    // `--use-fake-device-for-media-stream`.
    // With more than one source the app shows its own picker (a native menu),
    // in which we pick the fake screen.
    await bob.app.evaluate(({ desktopCapturer, nativeImage, Menu }) => {
      const g = globalThis as { getSourcesCalls?: number; picker?: string[] }
      g.getSourcesCalls = 0
      const source = (id: string, name: string) => ({
        id,
        name,
        thumbnail: nativeImage.createEmpty(),
        display_id: '',
        appIcon: nativeImage.createEmpty(),
      })
      desktopCapturer.getSources = async () => {
        g.getSourcesCalls!++
        return [
          source('screen:-3:0', 'Fake screen'),
          source('window:-3:0', 'Fake window'),
        ]
      }
      Menu.prototype.popup = function (options) {
        g.picker = this.items.map(item => item.label)
        this.items.find(item => item.label === 'Fake screen')!.click()
        options?.callback?.()
      }
    })

    await bobCall.getByRole('button', { name: 'Share screen' }).click()
    await expect(
      bobCall.getByRole('button', { name: 'Stop sharing screen' })
    ).toBeVisible()
    expect(
      await bob.app.evaluate(() => {
        const g = globalThis as { getSourcesCalls?: number; picker?: string[] }
        return { getSourcesCalls: g.getSourcesCalls, picker: g.picker }
      })
    ).toEqual({
      getSourcesCalls: 1,
      picker: ['Fake screen', '', 'Fake window'],
    })
    await expect.poll(() => isShowingRemoteVideo(aliceCall)).toBe(true)

    await bobCall.getByRole('button', { name: 'Stop sharing screen' }).click()
    await expect(
      bobCall.getByRole('button', { name: 'Share screen' })
    ).toBeVisible()
    await expect.poll(() => isShowingRemoteVideo(aliceCall)).toBe(false)
    // Still connected.
    expect(await isReceivingAudio(aliceCall)).toBe(true)
  }
)

test('hanging up ends the call for both parties', { tag: RELAY }, async () => {
  // The button closes its window synchronously, so the click can fail
  // with "Target page closed" before Playwright has finished it.
  await bobCall
    .getByRole('button', { name: 'End call' })
    .click()
    .catch(error => {
      if (!bobCall.isClosed()) {
        throw error
      }
    })

  await expect(async () => {
    expect(bobCall.isClosed()).toBe(true)
    expect(aliceCall.isClosed()).toBe(true)
  }).toPass({ timeout: 60_000 })

  // An accepted call shows its duration in the call message.
  await selectChat(alice.mainWindow, bobUser.name)
  for (const page of [bob.mainWindow, alice.mainWindow]) {
    const callMessage = page
      .getByRole('list', { name: 'Messages' })
      .getByRole('listitem')
      .last()
    await expect(callMessage).toContainText('Audio call')
    await expect(callMessage).toContainText('<1 minute')
  }
})
