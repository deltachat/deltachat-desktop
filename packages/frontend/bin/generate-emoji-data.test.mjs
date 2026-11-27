import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import test from 'node:test'
import { format } from 'prettier'
import { generateEmojiData } from './generate-emoji-data.mjs'

const require = createRequire(import.meta.url)
const source = require('emoji-datasource')
const baseline = require('@emoji-mart/data')
const generated = generateEmojiData(source, baseline)

test('existing selections, skin tones, aliases and search terms survive', () => {
  for (const previous of Object.values(baseline.emojis)) {
    const current = generated.emojis[previous.id]
    assert.deepEqual(current.skins, previous.skins, previous.id)
    assert.equal(current.name, previous.name)
    for (const keyword of previous.keywords) {
      assert(current.keywords.includes(keyword), `${previous.id}: ${keyword}`)
    }
    assert.deepEqual(current.emoticons, previous.emoticons, previous.id)
  }
  for (const [alias, id] of Object.entries(baseline.aliases)) {
    assert.equal(generated.aliases[alias], id)
  }
})

test('includes new emoji, ZWJ sequences, flags and their skin tones', () => {
  assert.equal(generated.emojiVersion, 16)
  assert.equal(generated.emojis.face_with_bags_under_eyes.skins[0].native, '🫩')
  assert.equal(generated.emojis.phoenix.skins[0].native, '🐦‍🔥')
  assert.equal(generated.emojis['flag-sark'].skins[0].native, '🇨🇶')
  assert.equal(
    generated.emojis.person_walking_facing_right.skins[3].native,
    '🚶🏽‍➡️'
  )
  const ids = generated.categories.flatMap(category => category.emojis)
  assert.equal(new Set(ids).size, ids.length)
  assert.deepEqual([...ids].sort(), Object.keys(generated.emojis).sort())
})

test('retains stored IDs when upstream short names change', () => {
  const entry = source.find(entry => entry.short_name === 'grinning')
  const renamed = source.map(item =>
    item === entry
      ? { ...item, short_name: 'renamed_grin', short_names: ['renamed_grin'] }
      : item
  )
  const data = generateEmojiData(renamed, baseline)
  assert.equal(data.emojis.grinning.skins[0].native, '😀')
  assert.equal(data.aliases.renamed_grin, 'grinning')
})

test('rejects removed emoji and unknown categories instead of losing data', () => {
  assert.throws(() => generateEmojiData([], baseline), /removed or reassigned/)
  assert.throws(
    () => generateEmojiData([{ ...source[0], category: 'Unknown' }], baseline),
    /Unknown category/
  )
})

test('generation is deterministic and the checked-in data is current', async () => {
  assert.deepEqual(
    generateEmojiData([...source].reverse(), baseline),
    generated
  )
  const json = await format(JSON.stringify(generated), { parser: 'json' })
  assert.equal(
    await readFile(
      new URL('../src/data/emoji/emoji.json', import.meta.url),
      'utf8'
    ),
    json
  )
})
