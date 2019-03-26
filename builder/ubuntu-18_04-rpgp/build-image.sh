#!/bin/bash
SCRIPT=`realpath $0`
SCRIPTPATH=`dirname $SCRIPT`

docker build -t builder-deltachat-desktop-ubuntu-18_04-rpgp -f "$SCRIPTPATH/docker/Dockerfile" "$SCRIPTPATH/build-context"
