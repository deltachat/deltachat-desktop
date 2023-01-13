import React from 'react'
import { runtime } from '../../runtime'
import { contributeUrl, donationUrl } from '../../../shared/constants'

export function SettingsDonate({}: {}) {
  const tx = window.static_translate

  const MoneySection = true /* isMacAppstoreBuild */
    ? DonateMacOSAppstore
    : DonateMoney

  return (
    <div className='donate-page'>
      <p className='donate-reason'>{tx('donate_money_reason')}</p>
      <div className='donate-money-section'>
        <MoneySection />
      </div>
      <div className='spacer'></div>
      <div className='donate-time-section'>
        <p className='other-ways'>
          {tx('other_ways_to_contribute_description')}
        </p>
        <button onClick={() => runtime.openLink(contributeUrl)}>
          <span className='label'>{tx('other_ways_to_contribute')}</span>
          <div
            className='Icon'
            style={{
              WebkitMask:
                'url(../images/icons/open_in_new.svg) no-repeat center',
            }}
          ></div>
        </button>
      </div>
    </div>
  )
}

function DonateMoney() {
  const tx = window.static_translate
  return (
    <button onClick={() => runtime.openLink(donationUrl)}>
      <span className='label'>{tx('donate_money')}</span>
      <div
        className='Icon'
        style={{
          WebkitMask: 'url(../images/icons/open_in_new.svg) no-repeat center',
        }}
      ></div>
    </button>
  )
}

function DonateMacOSAppstore() {

  // only one recuring donation option, because otherwise we'd need to track if the user is already subscribed
  return (
    <div>

      <button
        onClick={() =>
          runtime.openLink('https://apps.apple.com/account/subscriptions')
        }
      >
        Manage Recuring Donation
      </button>
    </div>
  )
}
