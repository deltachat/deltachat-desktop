#!/bin/bash

pushd ci_scripts/ubuntu-16_04

docker build -t builder-deltachat-desktop-ubuntu-16_04 docker

popd
