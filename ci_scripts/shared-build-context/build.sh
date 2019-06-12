#!/bin/bash
set -xe 

if [ -z ${BUILDER_NAME+x} ]; then
  echo "Error: Environment variable BUILDER_NAME is unset. It should be set to
  the first child folder name in \`/builder\` and is normally set in the Dockerfile
  for this builder. Examples for values are \`ubuntu-16_04\` or \`ubunut-18_10-rpgp\`.";
  exit 0
fi


# BUILD DESKTOP
cd /build

# reinstall dependencies
rm -rf node_modules
npm install


# actually build desktop files
cd /build
npm run build


# build .deb with electron builder (rebuilds deltachat-core for electron)
npx electron-builder -c /shared-build-context/electron-builder-ubuntu.json

