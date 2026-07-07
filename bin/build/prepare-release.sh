#!/bin/bash
# Prepare a new release
#
# Usage: ./bin/prepare-release.sh 2.23.0

set -e

if [ -z "$1" ]; then
    echo "❌ Error: Version argument required"
    echo "Usage: ./bin/prepare-release.sh VERSION"
    exit 1
fi

VERSION="$1"
CLEAN_VERSION=$(echo "$VERSION" | sed 's/^v//')

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "Preparing release ${CLEAN_VERSION}"
echo "=================================="
echo ""

# Step 1: Update version in all package.json files and Cargo.toml
echo "📦 Step 1: Updating version numbers..."
node ./bin/update_desktop_version.js "$CLEAN_VERSION"
echo ""

# Step 2: Update CHANGELOG
echo "📝 Step 2: Updating CHANGELOG..."
./bin/update-changelog.sh "$CLEAN_VERSION"
echo ""

# Step 3: Format package.json files
echo "🎨 Step 3: Formatting package.json files..."
pnpm prettier --write --log-level=silent "packages/target**/package.json" "package.json"
echo "✅ Formatted package.json files"
echo ""

# Step 4: Update pnpm lock file
echo "🔒 Step 4: Updating pnpm-lock.yaml..."
pnpm install --lockfile-only
echo "✅ Updated pnpm-lock.yaml"
echo ""

echo "✅ Release ${CLEAN_VERSION} prepared successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Review and cleanup the CHANGELOG.md"
echo "   2. Make any manual edits if needed"
echo "   3. Add all changes and commit everything:"
echo "      git checkout -b \"prepare-release-${CLEAN_VERSION}\""
echo "      git commit -m \"chore: prepare release ${CLEAN_VERSION}\""
echo "   4. When merged create and push the tag:"
echo "      git tag v${CLEAN_VERSION}"
echo "      git push origin v${CLEAN_VERSION}"
echo ""
