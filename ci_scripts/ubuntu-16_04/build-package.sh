#/bin/bash
SCRIPT=`realpath $0`
SCRIPTPATH=`dirname $SCRIPT`

docker run --rm -it -v "$SCRIPTPATH/../..":/build  -w /build-context builder-deltachat-desktop-ubuntu-16_04 bash -i -c './build.sh'
