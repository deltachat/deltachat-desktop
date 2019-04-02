#!/bin/bash

DIR=${1:?specify directory of ubuntu docker dir}
export BUILDER_NAME=$(basename $DIR)
export DOCKERTAG=deltachat/desktop-$BUILDER_NAME 

docker build -t $DOCKERTAG $DIR
