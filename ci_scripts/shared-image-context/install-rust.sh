#/bin/bash
set -xe

apt -y install curl
curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain nightly-2019-03-23 -y

