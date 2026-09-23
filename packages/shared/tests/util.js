//@ts-check
/* global it */
import { describe } from 'mocha'
import { expect } from 'chai'
import { isInviteLink, isInviteUri } from '../ts-compiled-for-tests/util.js'

describe('/shared/util', () => {
  it('isInviteLink', () => {
    expect(isInviteLink('https://i.delta.chat/#FPR&a=a%40b.de')).to.equal(true)
    expect(isInviteLink('HTTPS://I.DELTA.CHAT/#FPR&a=a%40b.de')).to.equal(true)
    expect(isInviteLink('https://i.delta.chat/')).to.equal(false)
    expect(isInviteLink('https://example.org/#FPR&a=a%40b.de')).to.equal(false)
    expect(isInviteLink('OPENPGP4FPR:FPR#a=a%40b.de')).to.equal(false)
  })

  it('isInviteUri', () => {
    expect(isInviteUri('https://i.delta.chat/#FPR&a=a%40b.de')).to.equal(true)
    expect(isInviteUri('OPENPGP4FPR:FPR#a=a%40b.de&n=Alice')).to.equal(true)
    expect(isInviteUri('openpgp4fpr:FPR#a=a%40b.de')).to.equal(true)
    expect(isInviteUri('openpgp4fpr')).to.equal(false)
    expect(isInviteUri('mailto:a@b.de')).to.equal(false)
    expect(isInviteUri('some search query')).to.equal(false)
  })
})
