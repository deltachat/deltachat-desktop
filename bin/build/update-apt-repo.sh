#!/bin/bash
# Regenerate the apt repository index for the Delta Chat desktop downloads.
#
# The builds on https://download.delta.chat/desktop/ are served as a "flat"
# (trivial) apt repository: the index files live next to the version
# directories instead of in a dists/ tree.  This keeps one stable source line
# working for all releases, so that users get new versions with a plain
# "apt update" without having to edit anything:
#
#   deb [trusted=yes] https://download.delta.chat/desktop/ ./
#
# With a signed Release, replace [trusted=yes] by:
#
#   [signed-by=/usr/share/keyrings/deltachat-desktop-archive-keyring.gpg]
#
# Run this after uploading the builds of a release.  The script only needs
# bash, coreutils and `apt-ftparchive` (package "apt-utils"), so it can be
# piped to the download server over ssh:
#
#   ssh download.delta.chat bash -s -- <download-dir> < bin/build/update-apt-repo.sh
#
# or run locally:
#
#   ./bin/build/update-apt-repo.sh <download-dir>
#
# <download-dir> is the directory that is served as
# https://download.delta.chat/desktop/ and that contains one subdirectory per
# released version:
#
#   <download-dir>/v2.59.1/deltachat-desktop_2.59.1_amd64.deb
#   <download-dir>/v2.62.0/deltachat-desktop_2.62.0_amd64.deb
#   <download-dir>/v2.63.0/deltachat-desktop_2.63.0_amd64.deb
#
# The generated files are Packages, Release, optional InRelease/Release.gpg
# and the by-hash/ directories; all .deb files are indexed, also those of
# older versions, so that apt always resolves the newest version itself.

set -euo pipefail

usage() {
    cat <<'EOF'
Usage: update-apt-repo.sh [--sign <gpg-key-id>] <download-dir>

  <download-dir>  directory containing the version directories with the .deb
                  files; index files are written there
  --sign KEY      additionally create a signed InRelease and Release.gpg
                  using the given gpg key
  -h, --help      show this help
EOF
}

SIGN_KEY=""
DOWNLOAD_DIR=""

while [ $# -gt 0 ]; do
    case "$1" in
        --sign)
            [ $# -ge 2 ] || { echo "error: --sign needs a gpg key id" >&2; exit 1; }
            SIGN_KEY="$2"
            shift 2
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        -*)
            echo "error: unknown option: $1" >&2
            usage >&2
            exit 1
            ;;
        *)
            [ -z "$DOWNLOAD_DIR" ] || { echo "error: too many arguments" >&2; usage >&2; exit 1; }
            DOWNLOAD_DIR="$1"
            shift
            ;;
    esac
done

[ -n "$DOWNLOAD_DIR" ] || { usage >&2; exit 1; }
[ -d "$DOWNLOAD_DIR" ] || { echo "error: no such directory: $DOWNLOAD_DIR" >&2; exit 1; }

command -v apt-ftparchive >/dev/null 2>&1 || {
    echo "error: apt-ftparchive not found, install the 'apt-utils' package" >&2
    exit 1
}

cd "$DOWNLOAD_DIR"

if [ -z "$(find . -name '*.deb' -print -quit)" ]; then
    echo "error: no .deb files below $(pwd)" >&2
    exit 1
fi

# The index is built in a staging directory so that the previous Release file
# (if any) does not end up hashing itself.
STAGING_DIR="$(mktemp -d)"
trap 'rm -rf "$STAGING_DIR"' EXIT

echo "Indexing $(find . -name '*.deb' | wc -l) .deb file(s) ..."
# apt-ftparchive records the paths as given on the command line, so running it
# on "." yields "./v2.62.0/..."; strip the leading "./" to get the canonical
# form, paths are relative to the source url.
apt-ftparchive packages . | sed 's|^Filename: \./|Filename: |' > Packages
cp Packages "$STAGING_DIR/Packages"

echo "Generating Release ..."
apt-ftparchive release \
    -o APT::FTPArchive::Release::Origin="Delta Chat" \
    -o APT::FTPArchive::Release::Label="Delta Chat" \
    -o APT::FTPArchive::Release::Suite=./ \
    -o APT::FTPArchive::Release::Codename=stable \
    -o APT::FTPArchive::Release::Architectures="amd64 arm64" \
    -o APT::FTPArchive::Release::Acquire-By-Hash=yes \
    "$STAGING_DIR" > Release

echo "Generating by-hash ..."
rm -rf by-hash
for algorithm in SHA256 SHA512; do
    hash="$("$(echo "$algorithm" | tr 'A-Z' 'a-z')sum" Packages | cut -d' ' -f1)"
    mkdir -p "by-hash/$algorithm"
    # hard links keep the download directory small
    cp -l Packages "by-hash/$algorithm/$hash" 2>/dev/null || cp Packages "by-hash/$algorithm/$hash"
done

if [ -n "$SIGN_KEY" ]; then
    command -v gpg >/dev/null 2>&1 || { echo "error: gpg not found" >&2; exit 1; }
    echo "Signing Release with $SIGN_KEY ..."
    gpg --batch --yes --local-user "$SIGN_KEY" --digest-algo SHA256 --clearsign -o InRelease Release
    gpg --batch --yes --local-user "$SIGN_KEY" --armor --detach-sign -o Release.gpg Release
else
    rm -f InRelease Release.gpg
fi

echo
echo "Index updated in $(pwd):"
grep -c '^Package: ' Packages | sed 's/^/  packages: /'
grep -c '^Version: ' Packages | sed 's/^/  versions: /'
echo "  files: $(ls -1 Packages Release $(if [ -n "$SIGN_KEY" ]; then echo InRelease Release.gpg; fi) | tr '\n' ' ')"
