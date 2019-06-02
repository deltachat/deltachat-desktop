#/bin/bash
set -xe

_gittag="v0.2.0-alpha"

cd /tmp
git clone --branch $_gittag https://github.com/rpgp/rpgp.git

cd rpgp/pgp-ffi
PREFIX=/opt/DeltaChat/rpgp make install

# cleanup
cd / && rm -rf /tmp/rpgp
