#!/bin/bash

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
cp -r /deltachat-core .
npm install

#npm install --build-from-source
#npm run build
#npx electron-builder -c /build-context/electron-builder-ubuntu.json
