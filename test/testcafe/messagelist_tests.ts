import { ClientFunction, Selector } from 'testcafe'
import { waitForReact } from 'testcafe-react-selectors'
import { ReactSelector } from 'testcafe-react-selectors'
import { createTmpUser } from '../integration/fixtures/config'
import { C, DeltaChat } from 'deltachat-node'
import type { Context } from 'deltachat-node/dist/context'
import { join } from 'path'
import { rmSync } from 'fs'

console.log('cleaning up test dir')
rmSync(join(__dirname, '../../.test_tmp_data'), { recursive: true })
console.log('cleaned up test dir')

export const translate = ClientFunction((...args) =>
  (window as any).static_translate(...args)
)

let config: {
  account_a_email: string
  account_a_password: string
  /** device a, this is used as multidevice for the account that is on the desktop */
  device_a_context: Context
  /** device b, the contact we chat with */
  device_b_context: Context
  account_b_email: string
  wait_for_device_b_recv_msg: (timeout?: number) => Promise<{ data1; data2 }>
} | null = null

fixture`Test Messagelist`
  .page('../../html-dist/test.html')
  .before(async () => {
    console.log(process.env.TEST_DIR)
    if (!process.env.TEST_DIR) {
      throw new Error('TEST_DIR env var must be set')
    }

    // for some reason `tempy` generated directories don't let the core write files on macOS
    // so we need to provide some dirs for the test files

    const tmp_dirs = {
      device_b_dir: join(process.env.TEST_DIR, 'device_b'),
      device_a_dir: join(process.env.TEST_DIR, 'device_a'),
      desktop_dir: join(process.env.TEST_DIR, 'accounts'),
    }

    // setup testing
    const account_a = await createTmpUser()
    const account_b = await createTmpUser()

    // device b, the contact we chat with
    console.log('configure device_b...')
    const device_b = new DeltaChat(tmp_dirs.device_b_dir)
    device_b.startEvents()
    const device_b_context = device_b.accountContext(device_b.addAccount())
    await device_b_context.configure({
      addr: account_b.email,
      mail_pw: account_b.password,
      e2ee_enabled: 0, // encryption is disabled, because otherwise multidevice would be more complicated
    })
    device_b.startIO()
    console.log('configure device_b done')

    device_b.on('ALL', (event, accountid, data1, data2) => {
      //   console.debug('[B]: ', event, data1, data2)
    })

    device_b.on('DC_EVENT_INCOMING_MSG', (_acc, chat_id) => {
      device_b_context.acceptChat(chat_id)
    })

    // Account A
    const account_a_config = {
      addr: account_a.email,
      mail_pw: account_a.password,
      e2ee_enabled: 0, // encryption is disabled, because otherwise multidevice would be more complicated
      bcc_self: 1, // required for multidevice
    }

    // device a, this is used as multidevice and also for the desktop
    console.log('configure device_a...')
    const device_a = new DeltaChat(tmp_dirs.device_a_dir)
    device_a.startEvents()
    const device_a_context = device_a.accountContext(device_a.addAccount())
    await device_a_context.configure(account_a_config)
    device_a.startIO()
    console.log('configure device_a done')

    // setup account on desktop - does not work because desktop is loaded at the start of the test
    // console.log("configure desktop account...");
    // const desktop = new DeltaChat(tmp_dirs.desktop_dir)
    // desktop.startEvents()
    // const desktop_context = desktop.accountContext(desktop.addAccount())
    // await desktop_context.configure(account_a_config)
    // console.log("configure desktop account done");

    config = {
      account_a_email: account_a.email,
      account_a_password: account_a.password,
      device_a_context,
      device_b_context,
      account_b_email: account_b.email,
      wait_for_device_b_recv_msg: (timeout = 4000) => {
        let rej_timeout
        let rejected = false
        return new Promise((res, rej) => {
          device_b.once('DC_EVENT_INCOMING_MSG', (_acc, data1, data2) => {
            if (!rejected) {
              clearTimeout(rej_timeout)
              res({ data1, data2 })
            }
          })
          rej_timeout = setTimeout(() => {
            rejected = true
            rej(new Error('timeout'))
          })
        })
      },
    }
  })
  .beforeEach(async () => {
    await waitForReact()
  })

test('prepare testing: login to account A with desktop', async t => {
  //   const account_item = ReactSelector('AccountItem').withText(
  //     config.account_a_email
  //   )
  await t
    .click('#action-go-to-login')
    .typeText('#addr', config.account_a_email)
    .typeText('#mail_pw', config.account_a_password)
    .click('#action-login')
    .expect(Selector('.info-message.big', { timeout: 3000 }).innerText)
    .eql(await translate('no_chat_selected_suggestion_desktop'))
})

const clickChatByName = async (t, name) => {
  return t.click(
    Selector('.chat-list-item > .content > .header > .name > span').withText(
      name
    )
  )
}

async function clickAppMenuItem(t, label) {
  await t.click('#main-menu-button')
  await t.expect(Selector('a.bp3-menu-item').withText(label).exists).ok()
  await t.click(Selector('a.bp3-menu-item').withText(label))
}

async function send_msg(t, message) {
  await t
    .typeText('#composer-textarea', message)
    .click("button[aria-label='" + (await translate('menu_send')) + "']")
}

function endCode(msg) {
  return msg + Date.now()
}

function MSGinViewportSelector(timeout = 2000): Selector {
  return Selector(
    () => {
      let raw_labels = document.querySelectorAll('#message-list .msg-body')
      let labels = Array.prototype.slice.call(raw_labels)
      function isElementInViewport(el) {
        var rect = el.getBoundingClientRect()
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <=
            (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <=
            (window.innerWidth || document.documentElement.clientWidth)
        )
      }
      const targetLabels = labels.filter(label => isElementInViewport(label))
      console.log(labels, targetLabels)
      return targetLabels
    },
    { timeout, visibilityCheck: true }
  )
}

test('create chat with bot, so it is not a contact request', async t => {
  //   const account_item = ReactSelector('CreateChat').withText(
  //     config.account_a_email
  //   )
  await clickAppMenuItem(t, await translate('menu_new_chat'))

  await t.expect(Selector('.FixedDeltaDialog').exists).ok()
  await t.typeText('.FixedDeltaDialog input', config.account_b_email)
  await t
    .expect(
      Selector('div.display-name').withText(await translate('menu_new_contact'))
        .exists
    )
    .ok()
  await t.click(
    Selector('div.display-name')
      .withText(await translate('menu_new_contact'))
      .parent(0)
  )
  await clickChatByName(t, config.account_b_email)
  await send_msg(t, 'test')
  await t.expect(Selector('#message-list li').count).eql(1)
  await send_msg(t, 'test')
  await t.expect(Selector('#message-list li').count).eql(2)
})

test('incoming message from chat partner is received', async t => {
  await clickChatByName(t, config.account_b_email)
  let old_msg_count = await Selector('#message-list li').count
  config.device_b_context.sendMessage(12, 'hello world')
  await t
    .expect(MSGinViewportSelector().withText('hello world').exists)
    .ok('message not found in view')
  await t.expect(Selector('#message-list li').count).eql(old_msg_count + 1)
})

/** spam some bigger messages so we can test scrolling */
async function spam_messages(t, count = 12) {
  for (let i = 0; i < count; i++) {
    await send_msg(t, 'testing message:\n spam so we get the list full: ' + i)
  }
}

// scroll down to newest outgoing message
test('sending message scrolls down', async t => {
  await clickChatByName(t, config.account_b_email)
  // spam some bigger messages so we can test scrolling
  await spam_messages(t)
  const end_msg_code = endCode('end-off outgoing message spam')
  await send_msg(t, end_msg_code)
  await t
    .expect(MSGinViewportSelector().withText(end_msg_code).exists)
    .ok('message not found in view')
})

// scroll down to newest outgoing video chat invitation
// test('sending message scrolls down', async t => {
//     await clickChatByName(t, config.account_b_email)
//     // spam some bigger messages so we can test scrolling
//     await spam_messages(t)
//     const end_msg_code = endCode('end-off outgoing message spam')
//     await send_msg(t, end_msg_code)
//     await Selector('#message-list msg-body', { timeout: 2300, visibilityCheck: true }).withText(
//       end_msg_code
//     )
//   })

// scroll down to newest incoming message
test('receiving message scrolls down', async t => {
  await clickChatByName(t, config.account_b_email)
  // spam some bigger messages so we can test scrolling
  await spam_messages(t)
  for (let i = 0; i < 2; i++) {
    config.device_b_context.sendMessage(
      12,
      'testing message:\n spam so we get the list full: ' + i
    )
  }
  await t.wait(1000)
  const end_msg_code = endCode('end-off incoming message spam')
  config.device_b_context.sendMessage(12, end_msg_code)
  await t
    .expect(MSGinViewportSelector(6000).withText(end_msg_code).exists)
    .ok('message not found in view')
})
