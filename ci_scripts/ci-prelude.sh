#!/bin/bash

# This script prepares the CI host by installing external dependencies
# for the deltachat-node bindings.

set -ex

# To facilitate running locally, derive some Travis environment
# variables.
if [ -z "$TRAVIS_OS_NAME" ]; then
    case $(uname) in
        Darwin)
            TRAVIS_OS_NAME=osx
            ;;
        Linux)
            TRAVIS_OS_NAME=linux
            ;;
        *)
            echo "TRAVIS_OS_NAME unset and uname=$(uname) is unknown" >&2
            exit 1
    esac
fi
SYS_DC_CORE=${SYS_DC_CORE:-true}

export PKG_CONFIG_PATH=/usr/local/opt/openssl/lib/pkgconfig

# Use correct node version
chmod +x ./ci_scripts/shared-image-context/nvm-use.sh
./ci_scripts/shared-image-context/nvm-use.sh

# Install rust
chmod +x ./ci_scripts/shared-image-context/install-rust.sh
./ci_scripts/shared-image-context/install-rust.sh

# Include rust tools in PATH
if [ "$TRAVIS_OS_NAME" == "linux" ]; then
  PATH=/root/.cargo/bin:$PATH
else
  . ~/.cargo/env
fi
