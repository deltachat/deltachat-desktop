#!/bin/bash
set -e

cd packages/target-electron
pnpm add --save @deltachat/jsonrpc-client@catalog: @deltachat/stdio-rpc-server@catalog:

cd ../target-browser
pnpm add --save @deltachat/jsonrpc-client@catalog: @deltachat/stdio-rpc-server@catalog:

cd ../frontend
pnpm add @deltachat/jsonrpc-client@catalog:
