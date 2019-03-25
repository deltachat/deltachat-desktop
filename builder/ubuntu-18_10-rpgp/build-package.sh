#/bin/bash
SCRIPT=`realpath $0`
SCRIPTPATH=`dirname $SCRIPT`

docker run --rm -it -v "$SCRIPTPATH/../..":/build  -w /build-context builder-deltachat-desktop-ubuntu-18_10-rpgp bash -i -c 'tail -f /dev/null'
#docker run --rm -it -v "$SCRIPTPATH/../..":/build  -w /build-context builder-deltachat-desktop-ubuntu-18_10-rpgp tail -f /dev/null

