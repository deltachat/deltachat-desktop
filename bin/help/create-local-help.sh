#!/bin/bash

# update offline help; requires deltachat-pages repository to be at ../deltachat-pages
set -e

../deltachat-pages/tools/create-local-help.py ../deltachat-pages/_site static/help --add_pagefind

dirs=( $( ls ./static/help/  -1p | grep / | sed 's/\/$//' | sed 's/^\(.*\)/\1/') )

for LANGUAGE in "${dirs[@]}"; do
  FILE="./static/help/$LANGUAGE/help.html"
  echo ./static/help/$LANGUAGE
  if [ -f "$FILE" ]; then
    # remove previous generated files
    rm -r ./static/help/$LANGUAGE/pagefind
    npx pagefind --site ./static/help/$LANGUAGE
    # remove unused files
    rm ./static/help/$LANGUAGE/pagefind/*.css
    rm ./static/help/$LANGUAGE/pagefind/pagefind-*.js
  else
    echo "Datei $FILE nicht gefunden"
  fi
done

node ./bin/help/help-translations.js

echo
echo "☝️ Compliance Warning: Add the following line to CHANGELOG.md:"
echo "- Update local help ("`date "+%Y-%m-%d"`")"
echo
