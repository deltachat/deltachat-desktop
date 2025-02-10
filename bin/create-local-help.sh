# update offline help; requires deltachat-pages to be checked out beside deltachat-desktop
set -e

../deltachat-pages/tools/create-local-help.py ../deltachat-pages/result static/help

echo
echo "☝️ Compliance Warning: Add the following line to CHANGELOG.md:"
echo "- Update local help ("`date "+%Y-%m-%d"`")"
echo
