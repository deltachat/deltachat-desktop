#!/bin/bash
function minify-js() {
  FILE=$1
  FILE_SOURCE_MAP=$(basename $FILE).map
  
  echo "+ minfiying $FILE"
  size_before=$(stat --printf="%s" $FILE)
  
  npx terser $FILE -m -c --source-map "content='$FILE.map',url='$FILE_SOURCE_MAP'" -o $FILE	
  
  size_after=$(stat --printf="%s" $FILE)
  echo "+ size reduction: $((size_before - size_after))bytes $((1-$size_after/$size_before))%"
}

if [[ "$1" == "--help" || $1 == "" ]]; then
  cat << EOF
$0 [OPTIONS] file

Minify a javascript file using terser. The minified version will overwrite the
original one. This script also takes care of correctly composing the sourcemaps.

Example:
- $0 ./dist/js/index.js

Options:
--help    show this help
EOF
else
  minify-js $@
fi