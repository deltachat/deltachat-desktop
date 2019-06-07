#/bin/bash
set -xe

_gittag="0.2.1"

cd /tmp
git clone --branch $_gittag https://github.com/rpgp/rpgp.git

cd rpgp/pgp-ffi
PREFIX=/opt/DeltaChat/rpgp make install

# cleanup
cd / && rm -rf /tmp/rpgp
