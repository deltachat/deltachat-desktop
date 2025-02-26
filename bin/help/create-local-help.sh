#!/bin/bash

# update offline help; requires deltachat-pages repository to
# be at relative path ../deltachat-pages
set -e

../deltachat-pages/tools/create-local-help.py ../deltachat-pages/_site static/help --add_pagefind

dirs=( $( ls ./static/help/  -1p | grep / | sed 's/\/$//' | sed 's/^\(.*\)/\1/') )

rm ./static/help/pagefind.js
rm ./static/help/pagefind-ui.js

# Define an array of languages
# Iterate over the array of languages
for LANGUAGE in "${dirs[@]}"; do
  FILE="./static/help/$LANGUAGE/help.html"
  echo ./static/help/$LANGUAGE
  # check if file exists
  if [ -f "$FILE" ]; then
    rm -rf  ./static/help/$LANGUAGE/pagefind
    npx pagefind --site ./static/help/$LANGUAGE
    if [ "$LANGUAGE" == 'en' ]; then
      # copy pagefind files to help root
      cp ./static/help/$LANGUAGE/pagefind/pagefind.js ./static/help/pagefind.js
      cp ./static/help/$LANGUAGE/pagefind/pagefind-ui.js ./static/help/pagefind-ui.js
    fi
    # remove unused files
    rm ./static/help/$LANGUAGE/pagefind/*.css
    rm ./static/help/$LANGUAGE/pagefind/pagefind*.js
  else
    echo "File $FILE not found"
  fi
done

node ./bin/help/help-translations.js

echo
echo "☝️ Compliance Warning: Add the following line to CHANGELOG.md:"
echo "- Update local help ("`date "+%Y-%m-%d"`")"
echo
