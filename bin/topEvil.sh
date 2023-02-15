#!/bin/bash
cd "$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )/.."

echo "Top-Evil TypeScript"

res=$( grep -r "^import.*blueprint" src --color=always )
echo "🤔 Using Blueprint code: $( echo "$res" | wc -l )"
code=$( echo "$res" | wc -l )
echo "-----------------------------------------------------"
echo "$res"

res=$( grep -r "bp4-" src --color=always )
echo "🤔 Using Blueprint css classes: $( echo "$res" | wc -l )"
classes=$( echo "$res" | wc -l )
echo "-----------------------------------------------------"
echo "$res"

echo "Top-Evil SCSS"

res=$( grep -r ".bp4-" scss --color=always )
echo "🤔 Using Blueprint in css: $( echo "$res" | wc -l )"
scss=$( echo "$res" | wc -l )
echo "-----------------------------------------------------"
echo "$res"

echo "🤔Result🤔"
echo "CODE: $code | CLASSES: $classes | SCSS: $scss"

# res=$( grep -r "^import.*electron" src/main/deltachat --color=always )
# echo "🤔 Using Electron inside of the deltachat controller: $( echo "$res" | wc -l )"
# echo "-----------------------------------------------------"
# echo "$res"

# res=$( grep -r "require(" src/main --color=always )
# echo "🤔 Requires in main Process: $( echo "$res" | wc -l )"
# echo "-----------------------------------------------------"
# echo "$res"