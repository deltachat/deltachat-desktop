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
pnpm -w e2e --project <chromium | firefox | Chrome>
```

for headless usage

or

```sh
pnpm -w e2e --project <chromium | firefox | Chrome> --ui
```

for [UI mode](https://playwright.dev/docs/test-ui-mode)

If you omit the project parameter the tests will be executed in all configured browsers (Chrome, chromium, and Firefox at the moment)

The account dir for tests is in _packages/e2e-tests/data/accounts_

It can be deleted after running tests and will be recreated in the next run.
