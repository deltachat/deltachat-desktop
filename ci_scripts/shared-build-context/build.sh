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
PKG_CONFIG_PATH=/opt/DeltaChat/rpgp/lib/pkgconfig/ npm install

# recompile deltachat-core with prefix
cd /build/node_modules/deltachat-node/deltachat-core/
rm -rf builddir
PKG_CONFIG_PATH=/opt/DeltaChat/rpgp/lib/pkgconfig/ meson -Drpgp=true --prefix /opt/DeltaChat/libdeltachat builddir

# globally install libdeltachat
cd builddir
ninja install

# recompile node bindings
cd ..
npm run rebuild-bindings


# actually build desktop files
cd /build
ls /shared-build-context
#npm run build


# build .deb with electron builder (rebuilds deltachat-core for electron)
PKG_CONFIG_PATH=/opt/DeltaChat/rpgp/lib/pkgconfig/ npx electron-builder -c /shared-build-context/electron-builder-ubuntu.json

# EXTRACT ALREADY BUILT .DEB
cd "/build/dist/$BUILDER_NAME"

# remove linux-unpacked files, we don't need them anymore
rm -rf linux-unpacked

NAME_DEB=`basename $(find ./ -maxdepth 1 -name *.deb -print -quit)`

mkdir -p extract/DEBIAN
dpkg-deb -x $NAME_DEB extract
dpkg-deb -e $NAME_DEB extract/DEBIAN

# Fix extracted contents
cp -r /opt/DeltaChat/rpgp extract/opt/DeltaChat
cp -r /opt/DeltaChat/libdeltachat extract/opt/DeltaChat
mv extract/opt/DeltaChat/deltachat-desktop extract/opt/DeltaChat/deltachat-desktop-electron
cp /shared-build-context/deltachat-desktop extract/opt/DeltaChat

# Repack into .deb
rm $NAME_DEB
dpkg-deb -b extract $NAME_DEB

# Clean up extract folder
rm -rf extract

