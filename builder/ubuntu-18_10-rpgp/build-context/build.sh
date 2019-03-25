#!/bin/bash
BUILD_NAME="ubuntu-18_10-rpgp"

# Compile deltachat-core with rpgp
cd /
git clone https://github.com/deltachat/deltachat-core.git
cd deltachat-core/
git checkout fix_meson_rpgp_pkg-config
PKG_CONFIG_PATH=/opt/DeltaChat/rpgp/lib/pkgconfig/ meson -Dpgp=true --prefix /opt/DeltaChat/libdeltachat builddir
cd builddir/
ninja install

# Compile deltachat-node with our self compiled deltachat-core
git clone https://github.com/deltachat/deltachat-node.git
cd /deltachat-node
npm install
rm -rf deltachat-core
cp -r /deltachat-core .
cp /build-context/binding.gyp . # replace build script with fixed for rpgp one

# Build deltachat-desktop
cd /build
npm install --build-from-source
npm run build
npx electron-builder -c /build-context/electron-builder-ubuntu.json

# Extract already built .deb
cd "dist/$BUILD_NAME"
NAME_DEB=`basename $(find ./ -maxdepth 1 -name *.deb -print -quit)`
mkdir -p extract/DEBIAN
dpkg-deb -x $NAME_DEB extract
dpkg-deb -e $NAME_DEB extract/DEBIAN

# Fix extracted contents
cp -r /opt/DeltaChat/rpgp extract/opt/DeltaChat
cp -r /opt/DeltaChat/libdeltachat extract/opt/DeltaChat
mv extract/opt/DeltaChat/deltachat-desktop extract/opt/DeltaChat/deltachat-desktop-electron
cp /build/deltachat-desktop extract/opt/DeltaChat

# Repack into .deb
rm $NAME_DEB
dpkg-deb -b extract $NAME_DEB

