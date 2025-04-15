# Update core

[DeltaChat core](https://github.com/chatmail/core) is the base library that all clients and bots build upon and is the heart of DeltaChat.

To update the desktop application to a new core you need to update the following dependencies:

- `@deltachat/stdio-rpc-server` - contains the core in stdio rpc server form
- `@deltachat/jsonrpc-client` - The types for communicating with the core using the JSON-RPC API are contained within this module.

## Update to a tagged/released core version

Let's say the core version you want to upgrade to is `X.Y.Z`.

1. `node ./bin/link_core/link_version.js X.Y.Z`
2. mention that you updated those dependencies in `CHANGELOG.md`

If version `X.Y.Z` hasn't yet been published to `npm`, then ask another maintainer.

GitHub CI builds and publishes [stdio-rpc-server](https://github.com/chatmail/core/actions/workflows/deltachat-rpc-server.yml) and [jsonrpc-client](https://github.com/chatmail/core/actions/workflows/jsonrpc-client-npm-package.yml) to npm.

> bash shortcut `node ./bin/link_core/link_version.js 1.142.2`

> make sure you are in the repository root, otherwise the command will not work

## Update to a development version

So you are prototyping a new function and have a desktop and a core pr and want to link the core pr in the desktop pr so that the CI can properly test your pull request.

Then you need to use a local core checkout (the next section in this document).

Or point desktop to use the the new deltachat-rpc-server binary with the `DELTA_CHAT_RPC_SERVER` environment variable:

```
DELTA_CHAT_RPC_SERVER=path/to/deltachat-rpc-server pnpm -w dev:electron --allow-unsafe-core-replacement
```

You can easily get the deltachat-rpc-server binary for your pr by installing it with cargo install:

```
cargo install --git https://github.com/chatmail/core --branch <your-branch> deltachat-rpc-server
```

Then you can run:

```sh
# let it find the executable in $PATH
# - pro: faster to type, does a basic version check
# - contra: uses prebuild if not found in path
pnpm -w dev:electron --allow-unsafe-core-replacement
# explicitly set the rpc binary
# - pro: fails when the binary is not found
DELTA_CHAT_RPC_SERVER=$(which deltachat-rpc-server) pnpm -w dev:electron --allow-unsafe-core-replacement
```

> (on windows you need to look up how to set env vars yourself, but the command to find it is `where deltachat-rpc-server`)

> note: if you make changes to the jsonrpc api you also need to update the jsonrpc client (see step 4 & 5 from the next section, Unfortunately npm still does not support installing packages from git sub-directories)

## Use a local core git checkout

very useful for development.

But be aware: there might be **migrations** that are applied to your accounts databases and there is no way back, unless you have a **backup**!

If you already have a core git checkout, you can skip the first step. Set the environment variable CORE_REPO_CHECKOUT to point to your core repository (as a relative path to deltachat-desktop) if it's not "../core" or "../deltachat-core-rust".

1. clone the core repo, right next to your desktop repo folder: `git clone git@github.com:chatmail/core.git`
2. go into your core checkout and run `git pull` to update it to the newest version, then create a branch for your changes
3. run `python3 deltachat-rpc-server/npm-package/scripts/make_local_dev_version.py` (needs at least python 3.12)
4. run `npm i` and `npm run build` inside `../core/deltachat-jsonrpc/typescript/`
5. go into your desktop repo and run `./bin/link_core/link_local.sh` [^1]

Note that you need to run step 3 and 4 again after each change to core sourcecode.

> to reset to normal run `./bin/link_core/link_catalog.sh` [^1]

[^1]: for window look inside of the script to learn what to do and please write one for powershell
