#/bin/bash

DIR=${1:?specify directory of docker dir}
DOCKERTAG=deltachat/desktop-$(basename $DIR)

docker run --rm -it -v $(PWD):/build  -w /build-context $DOCKERTAG bash -i -c './build.sh'
