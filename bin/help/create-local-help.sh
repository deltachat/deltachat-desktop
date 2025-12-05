#!/bin/bash

# update offline help; requires deltachat-pages repository to
# be at relative path ../deltachat-pages
set -e

rm static/help/*.png
../deltachat-pages/tools/create-local-help.py ../deltachat-pages/result static/help --add_pagefind

# remove the existing pagefind directory, before creating a new one
rm -rf ./static/help/pagefind
npx pagefind --site ./static/help/

node ./bin/help/help-translations.js

echo
echo "☝️ compliance warning: pr title must read:"
echo "change: update local help"
echo
