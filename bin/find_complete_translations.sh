#!/bin/bash

# checks if there are any new translations which reached the threshold to be included in the language selection

threshold=150

code=$(cat <<EOF

const {readFileSync} = require('fs');

process.stdin.on('data', (d) => {
    let list = d.toString().split('\n').map(l=>{
        const [n, f] = l.trim().split(' ')
        
        return [Number(n), f && f.replace('_locales/','').replace('.xml','')]
    })
    // remove non lang file entries
    list.pop()
    list.pop()
    // filter list
    list = list.sort(([n1], [n2])=> n1-n2)
    list = list.filter(([n])=> n >= $threshold)

    const current_list = Object.keys(JSON.parse(readFileSync('_locales/_languages.json', 'utf-8')))

    //console.log(list.map(([n, l])=>l))

    for (const [n, l] of list) {
        if (current_list.indexOf(l) === -1) {
            console.log(l + ' is not in languagelist, despite having enough lines, maybe it is new')
        }
    }
})

EOF
)

wc -l _locales/*.xml | node -e "$code"