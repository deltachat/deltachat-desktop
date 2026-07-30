#!/usr/bin/env bash
set -e

# This script links the local core repository to the target packages.
# It is needed for the proxy workaround in the flatpak build process!

if [ -z "$CORE_REPO_CHECKOUT" ]; then
    if [ -d "../core" ]; then
    CORE_REPO_CHECKOUT="../core"
  elif [ -d "../deltachat-core-rust" ]; then
    CORE_REPO_CHECKOUT="../deltachat-core-rust"
  else
    echo "No valid directory found for CORE_REPO_CHECKOUT"
    exit 1
  fi
fi

cd packages/target-electron
pnpm add @deltachat/jsonrpc-client@link:../../$CORE_REPO_CHECKOUT/deltachat-jsonrpc/typescript \
@deltachat/stdio-rpc-server@link:../../$CORE_REPO_CHECKOUT/deltachat-rpc-server/npm-package

cd ../target-browser
pnpm add @deltachat/jsonrpc-client@link:../../$CORE_REPO_CHECKOUT/deltachat-jsonrpc/typescript \
@deltachat/stdio-rpc-server@link:../../$CORE_REPO_CHECKOUT/deltachat-rpc-server/npm-package

cd ../frontend
pnpm add @deltachat/jsonrpc-client@link:../../$CORE_REPO_CHECKOUT/deltachat-jsonrpc/typescript

cd ../runtime
pnpm add @deltachat/jsonrpc-client@link:../../$CORE_REPO_CHECKOUT/deltachat-jsonrpc/typescript
