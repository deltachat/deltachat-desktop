#/bin/bash

DIR=${1:?specify directory of ubuntu docker dir}
export BUILDER_NAME=$(basename $DIR)
export DOCKERTAG=deltachat/desktop-$BUILDER_NAME 

docker run -e BUILDER_NAME --rm -it -v $(PWD):/build  -w /build-context $DOCKERTAG bash -i -c './build.sh'
