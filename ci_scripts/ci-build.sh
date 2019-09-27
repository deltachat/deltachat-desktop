#!/bin/bash

# This ci step actually installs all node/npm dependencies for deltachat-desktop
# and builds desktop.

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

export PKG_CONFIG_PATH=/usr/local/opt/openssl/lib/pkgconfig
source $HOME/.cargo/env
echo $PATH

node --version
npm --version
cargo --version || true

npm install;
npm run build;
