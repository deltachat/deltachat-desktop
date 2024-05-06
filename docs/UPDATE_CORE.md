# Update core

[DeltaChat core](https://github.com/deltachat/deltachat-core-rust) is the base library that all clients and bots build upon and is the heart of DeltaChat.

To update the desktop application to a new core you need to update the following dependencies:

- `deltachat-node` - contains the core library, node bindings for the cffi and the node-gyp glue to make it work
- `@deltachat/jsonrpc-client` - The types for communicating with the core using the JSON-RPC API are contained within this module.

## Update to a tagged/released core version

Let's say the core version you want to upgrade to is `X.Y.Z`.

1. `npm i deltachat-node@X.Y.Z @deltachat/jsonrpc-client@X.Y.Z`
2. mention that you updated those dependencies in `CHANGELOG.md`

If version `X.Y.Z` hasn't yet been published to `npm`, then you need to publish the files from our download server to `npm` via the following commands:

```sh
npm publish https://download.delta.chat/node/deltachat-node-vX.Y.Z.tar.gz --access=public
npm publish https://download.delta.chat/node/deltachat-jsonrpc-client-vX.Y.Z.tar.gz --access=public
```

These files are automatically built by GitHub CI in the core repository and then uploaded to https://download.delta.chat/node/.

**NOTE** Publishing files to `npm` requires permission to do so. If you don't have the permissions to publish, ask someone else that does or ask to be added.

> bash shortcut `TAG=1.131.3 npm i deltachat-node@$TAG @deltachat/jsonrpc-client@$TAG`

## Update to a development version

So you are prototyping a new function and have a desktop and a core pr and want to link the core pr in the desktop pr so that the CI can properly test your pull request.

Then you need to use a local core checkout (the next section in this document).

Or point desktop to use the the new deltachat-rpc-server binary with the `DELTA_CHAT_RPC_SERVER` environment variable:

```
DELTA_CHAT_RPC_SERVER=path/to/deltachat-rpc-server npm run dev --allow-unsafe-core-replacement
```

You can easily get the deltachat-rpc-server binary for your pr by installing it with cargo install:

```
cargo install --git https://github.com/deltachat/deltachat-core-rust --branch <your-branch> deltachat-rpc-server
```

Then you can run:

```sh
# let it find the executable in $PATH
# - pro: faster to type, does a basic version check
# - contra: uses prebuild if not find in path
npm run dev --allow-unsafe-core-replacement
# explicitly set the rpc binary
# - pro: fails when the binary is not found
DELTA_CHAT_RPC_SERVER=$(which deltachat-rpc-server) npm run dev --allow-unsafe-core-replacement
```

> (on windows you need to look up how to set env vars yourself, but the command to find it is `where deltachat-rpc-server`)

> note: if you make changes to the jsonrpc api you also need to update the jsonrpc client (see step 4 & 5 from the next section, Unfortunately npm still does not support installing packages from git sub-directories)

## Use a local core git checkout

very useful for development.

If you already have a core git checkout, you can skip the first step.

1. clone the core repo, right next to your desktop repo folder: `git clone git@github.com:deltachat/deltachat-core-rust.git`
2. go into your core checkout and run `git pull` to update it to the newest version, then create a branch for your changes
3. run `python3 deltachat-rpc-server/npm-package/scripts/make_local_dev_version.py`
4. run `npm i` and `npm run build` inside `../deltachat-core-rust/deltachat-jsonrpc/typescript/`
5. go into your desktop repo and run `npm i --install-links ../deltachat-core-rust/deltachat-jsonrpc/typescript ../deltachat-core-rust/deltachat-rpc-server/npm-package`

Note that you need to run step 3, 4 and 5 again after each change to core sourcecode.
