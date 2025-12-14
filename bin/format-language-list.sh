#!/bin/bash
# formats & sorts language list and removes duplicated keys
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR/../"

RESULT=$(cat _locales/_languages.json | jq --sort-keys -r)
echo $RESULT > _locales/_languages.json

npx prettier --write _locales/_languages.json
