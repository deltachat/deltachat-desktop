# End to end tests

## Install playwright

after running `pnpm install`

cd into packages/e2e-tests

and run `npx playwright install --with-deps`

A convenient alternative to install and use playwright is the VSCode [plugin](https://playwright.dev/docs/getting-started-vscode). It also provides some functionality for running or recording tests.

## Usage

This package depends on the target-browser so make sure you prepared that to run (adding custom certificates). See [README](../packages/target-browser/Readme.md)

But don't run the browser at the same time, it will be started inside the test routine.

```sh
pnpm -w e2e
```

for headless usage

or

```sh
pnpm -w e2e --ui
```

for [UI mode](https://playwright.dev/docs/test-ui-mode)

If you omit the project parameter the tests will be executed in all configured browsers (Chrome, chromium, and Firefox at the moment)

The account dir for tests is in _packages/e2e-tests/data/accounts_

It can be deleted after running tests and will be recreated in the next run.

## Run e2e tests in docker

Requirements: docker

> ⚠ To avoid having data belonging to root in your working dir
> you have to add you local user UID & GID to a .env file in packages/e2e-tests
>
> To get your UID/GID run `id` in a terminal

If you run `pnpm e2e:docker` a container based on a linux/node image will be started and the tests will be executed there

So you don't need to install playwright locally

If you run it the first time it will take some time, since the image needs to be downloaded and playwright needs to be installed.
