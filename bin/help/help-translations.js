#!/usr/bin/env node
//@ts-check

import { readdir, readFile, writeFile } from 'fs/promises'
import { existsSync} from 'fs'

const translations = {
    "search": "Search",
    "clear_search": "Clear",
    "search_no_result_for_x": "No results for [SEARCH_TERM]",
    "one_result": "Result for [SEARCH_TERM]",
    "menu_help": "Help",
    "app_name": "Delta Chat",
}

async function main() {
    const files = await readdir('static/help/')
    const fallback = JSON.parse(await readFile(`_locales/_untranslated_en.json`, 'utf-8'))
    for (const file of files) {
        if (existsSync(`_locales/${file}.json`)) {
            const json = JSON.parse(await readFile(`_locales/${file}.json`, 'utf-8'))
            const helpLabel = {...translations}
            for (const key in translations) {
                if (json[key] || fallback[key]) {
                    helpLabel[key] = json[key]?.message || fallback[key].message
                }
            }
            helpLabel['placeholder'] = helpLabel['search']
            helpLabel['zero_results'] = helpLabel['search_no_result_for_x'].replace('"%s"', '[SEARCH_TERM]')
            await writeFile(`static/help/${file}/pagefind/locale.json`, JSON.stringify(helpLabel, null, 2))
        }
    }
}

main()
