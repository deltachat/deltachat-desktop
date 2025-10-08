import * as linkify from 'linkifyjs'
import { convertFediverseMentions } from '../utils/linkify/fediverseLinks.js'
import { expect } from 'chai'
import { beforeEach, describe, it } from 'mocha'
import { type customMultiToken } from '../components/message/MessageParser.js'

type ElementExpectOptions = {
  type: customMultiToken['t']
  value?: string
  initialText?: string
}

const elementExpectHelper = (
  elements: customMultiToken[],
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
    if (option.initialText) {
      expect(element.initialText).to.equal(
        option.initialText,
        'Element initialText should match'
      )
    }
  })
}

const elementExpectCountHelper = (
  elements: customMultiToken[],
  type: customMultiToken['t'],
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

  it('parses fediverse addresses as links', () => {
    const elements1 = convertFediverseMentions(
      linkify.tokenize('Written by @user@mastodon.social')
    )
    elementExpectHelper(elements1, [
      { type: 'text', value: 'Written by ' },
      {
        type: 'url',
        value: 'mastodon.social/@user',
        initialText: '@user@mastodon.social',
      },
    ])
    const elements2 = convertFediverseMentions(
      linkify.tokenize(
        'Written by @user@mastodon.social and @user2@subdomain.fostodon.social'
      )
    )
    elementExpectHelper(elements2, [
      { type: 'text', value: 'Written by ' },
      {
        type: 'url',
        value: 'mastodon.social/@user',
        initialText: '@user@mastodon.social',
      },
      { type: 'text', value: ' and ' },
      {
        type: 'url',
        value: 'subdomain.fostodon.social/@user2',
        initialText: '@user2@subdomain.fostodon.social',
      },
    ])
    const validAddresses = [
      '[@test@mastodon.social]',
      '(@user@test@mastodon.social)',
      '(some text@user@test@mastodon.social)',
      '${@user@mastodon.social}',
      '@foobar.test@fostodon.cloud',
      'some noise:@foobar.test@fostodon.cloud$',
      '@foobar.test@fostodon.cloud?foo=bar', // TBD: query params are removed from link!
    ]
    validAddresses.forEach(text => {
      const elements = convertFediverseMentions(linkify.tokenize(text))
      elementExpectCountHelper(elements, 'url', 1)
    })
  })

  it('ignores invalid fediverse addresses', () => {
    const invalidAddresses = [
      '@user@foo',
      'text@user@',
      '@@user@ ',
      '@user@',
      '@user@foo:test',
      '@user@foo.not',
    ]
    invalidAddresses.forEach(text => {
      const elements = convertFediverseMentions(linkify.tokenize(text))
      elementExpectCountHelper(elements, 'url', 0)
    })
    const invalidAddresses2 = [
      '@test@ mastodon.social',
      '@test@:mastodon.social',
      '@test@@mastodon.social',
    ]
    invalidAddresses2.forEach(text => {
      const elements = convertFediverseMentions(linkify.tokenize(text))
      elementExpectCountHelper(elements, 'url', 1)
      expect(elements[1].v).to.not.include('@')
    })
  })

  it('parses normal addresses as expected', () => {
    const elements1 = convertFediverseMentions(
      linkify.tokenize('https://user:pass@test.com')
    )
    elementExpectHelper(elements1, [
      { type: 'url', value: 'https://user:pass@test.com' },
    ])
    const elements2 = convertFediverseMentions(
      linkify.tokenize('mail@test.com')
    )
    elementExpectHelper(elements2, [{ type: 'email', value: 'mail@test.com' }])
  })
})
