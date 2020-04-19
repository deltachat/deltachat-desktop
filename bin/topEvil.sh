#!/bin/bash
cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )/.."

echo "Top-Evil JavaScript"

res=$( grep -r "^import.*electron" src/main/deltachat --color=always )
echo "🤔 Using Electron inside of the deltachat controller: $( echo "$res" | wc -l )"
echo "-----------------------------------------------------"
echo "$res"

res=$( grep -r "require(" src/main --color=always )
echo "🤔 Requires in main Process: $( echo "$res" | wc -l )"
echo "-----------------------------------------------------"
echo "$res"

res=$( grep -r "require(" src/shared --color=always)
echo "🤔 Requires in shared: $( echo "$res" | wc -l )"
echo "-----------------------------------------------------"
echo "$res"

res=$( grep -r "require(" src/renderer --color=always )
echo "🤔 Requires in renderer: $( echo "$res" | wc -l )"
echo "-----------------------------------------------------"
echo "$res"

res=$( find src/* | grep .js$ )
echo "🤔 Files that are still in JavaScript: $( echo "$res" | wc -l )"
echo "-----------------------------------------------------"
echo "$res"

res=$( grep -r "'styled-components'" src/renderer --color=always )
echo "🤔 Use of styled-components: $( echo "$res" | wc -l )"
echo "-----------------------------------------------------"
echo "$res"
