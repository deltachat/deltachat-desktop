#!/bin/bash
set -e

export CORE_REPO_CHECKOUT="../deltachat-core-rust"

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

cd ../target-tauri
pnpm add @deltachat/jsonrpc-client@link:../../$CORE_REPO_CHECKOUT/deltachat-jsonrpc/typescript

cd ../target-tauri/src-tauri/
cargo add deltachat --path ../../../$CORE_REPO_CHECKOUT \
&& cargo add deltachat-jsonrpc --path ../../../$CORE_REPO_CHECKOUT/deltachat-jsonrpc \
|| echo "\n\nFailed to link local core to tauri: please update Cargo.toml in packages/target-tauri/src-tauri manually"