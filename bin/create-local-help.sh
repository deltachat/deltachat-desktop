#!/bin/bash

# update offline help; requires deltachat-pages to be checked out beside deltachat-desktop
set -e

# ../deltachat-pages/tools/create-local-help.py ../deltachat-pages/_site static/help

SEARCH="<link rel=\"stylesheet\" href=\"..\/help.css\" \/>"
REPLACE="<title>Results:<\/title>\n<link rel=\"stylesheet\" href=\"..\/help.css\" \/>\n<link href=\".\/pagefind\/pagefind-ui.css\" rel=\"stylesheet\"><script src=\".\/pagefind\/pagefind-ui.js\"><\/script><div id=\"search\"><\/div>\n<script>window.addEventListener('DOMContentLoaded', (event) => {new PagefindUI({ element: \"#search\", showSubResults: true, excerptLength: 30 });});<\/script>"

dirs=( $( ls ./static/help/  -1p | grep / | sed 's/^\(.*\)/\1/') )

# Define an array of languages

# Iterate over the array of languages
for LANGUAGE in "${dirs[@]}"; do
  FILE="./static/help/$LANGUAGE/help.html"
  echo ./static/help/$LANGUAGE
  npx pagefind --site ./static/help/$LANGUAGE
  # Überprüfen, ob die Datei existiert
  if [ -f "$FILE" ]; then
    # Ersetzen des Textes in der Datei
    sed -i "s/$SEARCH/$REPLACE/g" "$FILE"
    echo "Ersetzung erfolgreich in $FILE"
  else
    echo "Datei $FILE nicht gefunden"
  fi
done

echo
echo "☝️ Compliance Warning: Add the following line to CHANGELOG.md:"
echo "- Update local help ("`date "+%Y-%m-%d"`")"
echo


