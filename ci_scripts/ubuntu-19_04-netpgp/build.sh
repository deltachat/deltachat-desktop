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
rm -rf node_modules
# install dependencies and compile deltachat-node with some specific flags
mv package.json package.json.original
cat package.json.original | grep -v deltachat-node > package.json
npm install

# get deltachat-node from github
cd /build/node_modules
git clone --branch v0.44.1 https://github.com/deltachat/deltachat-node.git
cd deltachat-node
npm run submodule

# manually compile deltachat-core with netpgp
cd deltachat-core
meson -Drpgp=false builddir
cd builddir
ninja

# recompile node-bindings
cd /build/node_modules/deltachat-node
npm install
npm run rebuild-bindings

# reset package.json
cd /build
rm package.json
mv package.json.original package.json


# actually build desktop files
cd /build
npm run build


# build .deb with electron builder (rebuilds deltachat-core for electron)
npx electron-builder -c /build-context/electron-builder-ubuntu.json
