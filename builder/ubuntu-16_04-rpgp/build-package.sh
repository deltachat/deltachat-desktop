#/bin/bash
SCRIPT=`realpath $0`
SCRIPTPATH=`dirname $SCRIPT`

docker run --rm -it -v "$SCRIPTPATH/../..":/build  -w /build-context builder-deltachat-desktop-ubuntu-16_04-rpgp bash -i -c './build.sh; tail -f /dev/null'
#docker run --rm -it -v "$SCRIPTPATH/../..":/build  -w /build-context builder-deltachat-desktop-ubuntu-16_04-rpgp tail -f /dev/null

