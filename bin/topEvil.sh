#!/bin/bash
cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )/.."

echo "Top-Evil TypeScript"

res=$( grep -r "^import.*electron" src/main/deltachat --color=always )
echo "🤔 Using Electron inside of the deltachat controller: $( echo "$res" | wc -l )"
echo "-----------------------------------------------------"
echo "$res"

res=$( grep -r "require(" src/main --color=always )
echo "🤔 Requires in main Process: $( echo "$res" | wc -l )"
echo "-----------------------------------------------------"
echo "$res"