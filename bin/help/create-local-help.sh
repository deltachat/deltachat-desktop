#!/bin/bash

# update offline help; requires deltachat-pages to be checked out beside deltachat-desktop
set -e

../deltachat-pages/tools/create-local-help.py ../deltachat-pages/_site static/help

dirs=( $( ls ./static/help/  -1p | grep / | sed 's/\/$//' | sed 's/^\(.*\)/\1/') )

# Define an array of languages
# Iterate over the array of languages
for LANGUAGE in "${dirs[@]}"; do
  FILE="./static/help/$LANGUAGE/help.html"
  echo ./static/help/$LANGUAGE
  # Überprüfen, ob die Datei existiert
  if [ -f "$FILE" ]; then
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
