#!/bin/bash

set -e

if [[ "$TRAVIS_OS_NAME" == "linux" ]]; then
   # Set python 3.5 as preferred python3 interpreter (needed for pip3)
   sudo ln -sf /usr/bin/python3.5 /usr/bin/python3
   python3 --version

   # Install meson
   sudo pip3 install meson

   # Install ninja
   wget https://github.com/ninja-build/ninja/releases/download/v1.8.2/ninja-linux.zip
   unzip ninja-linux.zip
   sudo cp ninja /usr/bin

elif [[ "$TRAVIS_OS_NAME" == "osx" ]]; then
    brew install meson ninja
fi
