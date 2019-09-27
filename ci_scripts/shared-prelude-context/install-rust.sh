#!/bin/bash
set -xe
RUST_VERSION='none'

curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain $RUST_VERSION -y
