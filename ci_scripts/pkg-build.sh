#!/bin/bash

DIR=${1:?specify directory of ubuntu docker dir}
export BUILDER_NAME=$(basename $DIR)
export DOCKERTAG=deltachat/desktop-$BUILDER_NAME 

COMMAND="./build.sh"

if [ $2 = '--debug' ]; then
  COMMAND="$COMMAND && tail -f /dev/null"
fi

if [ $2 = '--shell' ]; then
  COMMAND="tail -f /dev/null"
fi

docker run -e BUILDER_NAME --rm -it \
  -v "${PWD}:/build" \
  -v "${PWD}/ci_scripts/shared-build-context:/shared-build-context" \
  -v "${PWD}/ci_scripts/${BUILDER_NAME}:/build-context" \
  -w /build-context \
  $DOCKERTAG \
  bash -i -c $COMMAND
