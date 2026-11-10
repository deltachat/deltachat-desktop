import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { format } from 'prettier'

const require = createRequire(import.meta.url)
const categories = {
  'Smileys & Emotion': 'people',
  'People & Body': 'people',
  'Animals & Nature': 'nature',
  'Food & Drink': 'foods',
  'Travel & Places': 'places',
  Activities: 'activity',
  Objects: 'objects',
  Symbols: 'symbols',
  Flags: 'flags',
}
const skinTones = ['1F3FB', '1F3FC', '1F3FD', '1F3FE', '1F3FF']

function skin(unified) {
  return {
    unified: unified.toLowerCase(),
    native: String.fromCodePoint(
      ...unified.split('-').map(code => parseInt(code, 16))
    ),
  }
}

/** Preserve IDs used by the picker's localStorage and existing search terms. */
export function generateEmojiData(source, baseline) {
  const byNative = new Map(
    Object.values(baseline.emojis).map(emoji => [emoji.skins[0].native, emoji])
  )
  const data = {
    emojiVersion: 0,
    categories: [...new Set(Object.values(categories))].map(id => ({
      id,
      emojis: [],
    })),
    emojis: {},
    aliases: { ...baseline.aliases },
    // Required by Emoji Mart's data shape; no sprite sheets are bundled.
    sheet: { cols: 0, rows: 0 },
  }
  const categoryById = new Map(data.categories.map(c => [c.id, c]))
  const sorted = [...source].sort(
    (a, b) =>
      a.sort_order - b.sort_order ||
      (a.short_name < b.short_name ? -1 : a.short_name > b.short_name ? 1 : 0)
  )
  for (const entry of sorted) {
    if (entry.category === 'Component') continue
    const category = categoryById.get(categories[entry.category])
    assert(category, `Unknown category: ${entry.category}`)
    const defaultSkin = skin(entry.unified)
    const previous = byNative.get(defaultSkin.native)
    const id = previous?.id ?? entry.short_name
    assert(!data.emojis[id], `Duplicate emoji ID: ${id}`)
    const version = Math.max(1, Number(entry.added_in))
    assert(Number.isFinite(version), `Invalid emoji version: ${id}`)
    data.emojiVersion = Math.max(data.emojiVersion, version)
    const names = [...new Set([entry.short_name, ...(entry.short_names ?? [])])]
    const skins = [defaultSkin]
    if (entry.skin_variations) {
      for (const tone of skinTones) {
        // Emoji Mart has one selector for both people's skin tones.
        const variant =
          entry.skin_variations[tone] ??
          entry.skin_variations[`${tone}-${tone}`]
        skins.push(variant ? skin(variant.unified) : null)
      }
    }
    const emoticons = [
      ...new Set([
        ...(previous?.emoticons ?? []),
        ...(entry.texts ?? []),
        ...(entry.text ? [entry.text] : []),
      ]),
    ]
    data.emojis[id] = {
      id,
      name:
        previous?.name ?? entry.name ?? entry.short_name.replaceAll('_', ' '),
      keywords: [
        ...new Set([
          ...(previous?.keywords ?? []),
          ...names.flatMap(name => name.split(/[_-]/)),
        ]),
      ],
      skins,
      version,
      ...(emoticons.length ? { emoticons } : {}),
    }
    category.emojis.push(id)
    for (const alias of names) {
      if (alias !== id) {
        assert(
          !data.aliases[alias] || data.aliases[alias] === id,
          `Conflicting alias: ${alias}`
        )
        data.aliases[alias] = id
      }
    }
  }
  for (const emoji of Object.values(baseline.emojis)) {
    assert.equal(
      data.emojis[emoji.id]?.skins[0].native,
      emoji.skins[0].native,
      `Existing emoji removed or reassigned: ${emoji.id}`
    )
  }
  for (const [alias, id] of Object.entries(data.aliases)) {
    assert(data.emojis[id], `Dangling alias: ${alias}`)
    assert(!data.emojis[alias] || alias === id, `Alias shadows emoji: ${alias}`)
  }
  return data
}

async function main() {
  const data = generateEmojiData(
    require('emoji-datasource'),
    require('@emoji-mart/data')
  )
  const json = await format(JSON.stringify(data), { parser: 'json' })
  await writeFile(
    new URL('../src/data/emoji/emoji.json', import.meta.url),
    json
  )
  console.log(
    `${Object.keys(data.emojis).length} emojis, Emoji ${data.emojiVersion}`
  )
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main()
}
