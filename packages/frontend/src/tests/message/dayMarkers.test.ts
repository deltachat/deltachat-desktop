import { expect } from 'chai'
import { describe, it } from 'mocha'
import moment from 'moment'

import { getDayStartMessageIds } from '../../components/message/dayMarkers.js'

const NOON = moment('2026-03-10T12:00:00').unix()
const DAY = 24 * 60 * 60

function dayStarts(
  timestamps: { [msgId: number]: number },
  prevTimestamp?: number
): number[] {
  const ids = Object.keys(timestamps).map(Number)
  return [...getDayStartMessageIds(ids, timestamps, prevTimestamp)]
}

describe('getDayStartMessageIds', () => {
  it('marks the oldest message of the chat', () => {
    expect(dayStarts({ 10: NOON, 11: NOON + 60 })).to.deep.equal([10])
  })

  it('marks every change of day', () => {
    expect(
      dayStarts({ 10: NOON, 11: NOON + DAY, 12: NOON + DAY + 60 })
    ).to.deep.equal([10, 11])
  })

  it('gives info messages with timestamp 0 no marker', () => {
    expect(dayStarts({ 10: 0, 11: 0 })).to.deep.equal([])
  })

  it('marks the first real message after info messages with timestamp 0', () => {
    expect(dayStarts({ 10: 0, 11: 0, 12: NOON })).to.deep.equal([12])
  })

  it('uses prevTimestamp to classify the topmost message', () => {
    expect(dayStarts({ 20: NOON }, NOON - 60)).to.deep.equal([])
    expect(dayStarts({ 20: NOON }, NOON - DAY)).to.deep.equal([20])
  })

  it('does not guess the day after a message without timestamp', () => {
    const ids = [10, 11, 12]
    expect([
      ...getDayStartMessageIds(ids, { 10: NOON, 12: NOON + DAY }, NOON - 60),
    ]).to.deep.equal([])
  })
})
