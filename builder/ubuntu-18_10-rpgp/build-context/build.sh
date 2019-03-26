#!/bin/bash

if [ -z ${BUILDER_NAME+x} ]; then
  echo "Error: Environment variable BUILDER_NAME is unset. It should be set to
  the first child folder name in \`/builder\` and is normally set in the Dockerfile
  for this builder. Examples for values are \`ubuntu-16_04\` or \`ubunut-18_10-rpgp\`.";
  exit 0
fi

# COMPILE DELTACHAT-CORE with RPGP
cd /
git clone https://github.com/deltachat/deltachat-core.git
cd deltachat-core/
PKG_CONFIG_PATH=/opt/DeltaChat/rpgp/lib/pkgconfig/ meson -Dpgp=true --prefix /opt/DeltaChat/libdeltachat builddir
cd builddir/
ninja install

# COMPILE DELTACHAT-NODE WITH OUR SELF COMPILED DELTACHAT-CORE
cd /
git clone https://github.com/deltachat/deltachat-node.git
cd /deltachat-node
npm install
rm -rf deltachat-core
cp -r /deltachat-core .

# COPY OVER MODIFIED BINDING.GYP
cp /build-context/binding.gyp . # replace build script with fixed for rpgp one
# rebuild bindings, for whatever reason we need to install node-gyp to make it
# work
npm install node-gyp
npx node-gyp rebuild

# BUILD DELTACHAT-DESKTOP
cd /build
rm -rf node_modules
npm install

# Replace deltachat-node with our manually compiled
rm -rf node_modules/deltachat-node
cp -r /deltachat-node node_modules

# Rebuild desktop
npm run build
npx electron-builder -c /build-context/electron-builder-ubuntu.json

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
cp /build-context/deltachat-desktop extract/opt/DeltaChat

# Repack into .deb
rm $NAME_DEB
dpkg-deb -b extract $NAME_DEB

# Clean up extract folder
rm -rf extract

