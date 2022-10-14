# Update core

[DeltaChat core](https://github.com/deltachat/deltachat-core-rust) is the hearth of DeltaChat, it is the base library
that all clients and bots build upon.

To update core you need to update 2 dependencies:

- `deltachat-node` - contains the core library, node bindings for the cffi and the node-gyp glue to make it work
- `@deltachat/jsonrpc-client` - The types for communicating with the core using the JSON-RPC API are contained within this module.

## Update to a tagged/released core version

Let's say the core version you want to upgrade to is `X.Y.Z`.

1. `npm i deltachat-node@X.Y.Z @deltachat/jsonrpc-client@X.Y.Z`
2. mention that you updated those dependencies in `CHANGELOG.md`

If the core version is not uploaded to NPM yet, then you need to upload the files from our download server to NPM via `npm publish [url] --access=public` (if you have the rights to do so, otherwise ask us to do it).
They are built by GitHub CI in the core repo and then uploaded to https://download.delta.chat/node/.

## Update to a development version (for a pull request that needs a new core to be tested)

So you are prototyping a new function and have a desktop and a core pr and want to link the core pr in the desktop pr so that the CI can properly test your pull request.

> you can find preview packages for core prs in https://download.delta.chat/node/preview/, but keep in mind that **they are DELETED as soon as the pr is merged**.

For the example, let's say your pr has the ID `#1337` (replace 1337 with the ID of your pr):

```
npm i https://download.delta.chat/node/preview/deltachat-jsonrpc-client-1337.tar.gz
npm i https://download.delta.chat/node/preview/deltachat-node-1337.tar.gz
```

## Use a local core git checkout

very useful for development.

If you already have a core git checkout, you can skip the first step.

1. clone the core repo, right next to your desktop repo folder: `git clone git@github.com:deltachat/deltachat-core-rust.git`
2. go into your core checkout and run `git pull` to update it to the newest version, then create a branch for your changes
3. run `npm i` and `npm run build` inside `../deltachat-core-rust/`
4. run `npm i` and `npm run build` inside `../deltachat-core-rust/deltachat-jsonrpc/typescript/`
5. go into your desktop repo and run `npm i ../deltachat-core-rust/deltachat-jsonrpc/typescript` and `npm i ../deltachat-core-rust`

Note that you need to run step 3 and 4 again after each change to core sourcecode.
