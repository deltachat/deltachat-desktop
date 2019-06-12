#/bin/bash
set -xe
RUST_VERSION='nightly-2019-03-23'

curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain $RUST_VERSION -y

