#!/bin/bash

set -e

# Set python 3.5 as preferred python3 interpreter (needed for pip3)
sudo ln -sf /usr/bin/python3.5 /usr/bin/python3
python3 --version

# Install meson
sudo pip3 install meson

# Compile and install libsasl2-dev
wget http://http.debian.net/debian/pool/main/c/cyrus-sasl2/cyrus-sasl2_2.1.27~101-g0780600+dfsg.orig.tar.xz
tar xfv cyrus-sasl2_2.1.27~101-g0780600+dfsg.orig.tar.xz
pushd cyrus-sasl2-2.1.27~101-g0780600+dfsg.orig && ./autogen.sh && make && sudo make install && popd
rm -rf cyrus-sasl2-2.1.27~101-g0780600+dfsg.orig

# Install ninja-build
wget https://github.com/ninja-build/ninja/releases/download/v1.8.2/ninja-linux.zip
unzip ninja-linux.zip
sudo cp ninja /usr/bin
