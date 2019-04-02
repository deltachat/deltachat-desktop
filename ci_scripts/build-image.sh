#!/bin/bash

DIR=${1:?specify directory of ubuntu docker dir}
DOCKERTAG=deltachat/desktop-$(basename $DIR)

docker build -t deltachat-desktop-$(basename $DIR) $DIR
