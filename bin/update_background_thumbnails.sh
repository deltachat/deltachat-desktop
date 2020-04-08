#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

rm -r "$DIR/../images/backgrounds/thumb"
mkdir "$DIR/../images/backgrounds/thumb"

cd "$DIR/../images/backgrounds"

for filename in *.*; do
    convert $filename -resize 128x128 thumb/$filename
done