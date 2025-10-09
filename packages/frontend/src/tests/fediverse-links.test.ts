import * as linkify from 'linkifyjs'
import { clearFediverseMentions } from '../utils/linkify/clearFediverseMentions.js'
import { expect } from 'chai'
import { beforeEach, describe, it } from 'mocha'

type ElementExpectOptions = {
  type: linkify.MultiToken['t']
  value?: string
}

const elementExpectHelper = (
  elements: linkify.MultiToken[],
  options: ElementExpectOptions[]
) => {
  expect(elements.length).to.equal(
    options.length,
    'Number of elements should match'
  )

  elements.forEach((element, index) => {
    const option = options[index]
    expect(element.t).to.equal(option.type, 'Element type should match')
    if (option.value) {
      expect(element.v).to.equal(option.value, 'Element value should match')
    }
  })
}

const elementExpectCountHelper = (
  elements: linkify.MultiToken[],
  type: linkify.MultiToken['t'],
  count: number
) => {
  const filtered = elements.filter(e => e.t === type)
  expect(filtered.length).to.equal(
    count,
    `There should be ${count} elements of type ${type}`
  )
}

describe('linkify-plugin-botcommand', () => {
  beforeEach(() => {
    linkify.reset()
  })

  it('parses fediverse addresses as text', () => {
    const elements1 = clearFediverseMentions(
      linkify.tokenize('Written by @user@mastodon.social')
    )
    elementExpectHelper(elements1, [
      { type: 'text', value: 'Written by @user@mastodon.social' },
    ])
    const elements2 = clearFediverseMentions(
      linkify.tokenize(
        'Written by @user@mastodon.social and @user2@subdomain.fostodon.social'
      )
    )
    elementExpectHelper(elements2, [
      { type: 'text', value: 'Written by @user@mastodon.social' },
      { type: 'text', value: ' and @user2@subdomain.fostodon.social' },
    ])
    const fediverseMentions = [
      '[@test@mastodon.social]',
      '(@user@test@mastodon.social)',
      '(some text@user@test@mastodon.social)',
      '${@user@mastodon.social}',
      '@foobar.test@fostodon.cloud',
      'some noise:@foobar.test@fostodon.cloud$',
      '@foobar.test@fostodon.cloud?foo=bar', // TBD: query params are removed from link!
    ]
    fediverseMentions.forEach(text => {
      const elements = clearFediverseMentions(linkify.tokenize(text))
      elementExpectCountHelper(elements, 'url', 0)
    })
  })

  it('parses normal addresses as expected', () => {
    const elements1 = clearFediverseMentions(
      linkify.tokenize('https://user:pass@test.com')
    )
    elementExpectHelper(elements1, [
      { type: 'url', value: 'https://user:pass@test.com' },
    ])
    const elements2 = clearFediverseMentions(linkify.tokenize('mail@test.com'))
    elementExpectHelper(elements2, [{ type: 'email', value: 'mail@test.com' }])
  })
})
