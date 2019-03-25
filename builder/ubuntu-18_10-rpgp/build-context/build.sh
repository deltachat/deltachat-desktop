#!/bin/bash

# Compile deltachat-core with rpgp
cd /
git clone https://github.com/deltachat/deltachat-core.git
cd deltachat-core/
git checkout fix_meson_rpgp_pkg-config
PKG_CONFIG_PATH=/opt/DeltaChat/rpgp/lib/pkgconfig/ meson -Dpgp=true --prefix /opt/DeltaChat/libdeltachat builddir
cd builddir/
ninja install

cd /
git clone https://github.
cd /
@sngit clone https://github.com/deltachat/deltachat-node.git
cd deltachat-node/
cp -r /deltachat-core .
ls -al
npm install
npx node-gyp build
node_modules
#npm install --build-from-source
#npm run build
#npx electron-builder -c /build-context/electron-builder-ubuntu.json
