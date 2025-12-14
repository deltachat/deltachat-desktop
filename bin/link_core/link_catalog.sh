#!/usr/bin/env bash
set -e

cd packages/target-electron
pnpm add --save @deltachat/jsonrpc-client@catalog: @deltachat/stdio-rpc-server@catalog:

cd ../target-browser
pnpm add --save @deltachat/jsonrpc-client@catalog: @deltachat/stdio-rpc-server@catalog:

cd ../frontend
pnpm add @deltachat/jsonrpc-client@catalog:

cd ../runtime
pnpm add @deltachat/jsonrpc-client@catalog:

cd ../target-tauri
pnpm add --save @deltachat/jsonrpc-client@catalog:
