# End to end tests

## Install playwright

cd into packages/e2e-tests

and run `pnpm create playwright`

in the upcoming dialog

selects "tests" as target for tests and skip the creation of playwright.config.ts

after the install remove the created tests/examples and packages/e2e-tests/tests/example.spec.ts

A convenient alternative to install and use playwright is the VSCode [plugin](https://playwright.dev/docs/getting-started-vscode). It also provides some functionality for running or recording tests.

## Usage

`pnpm e2e --project <chromium | firefox | Chrome>` for headless usage

or

`pnpm e2e --project <chromium | firefox | Chrome> --ui`

for [UI mode](https://playwright.dev/docs/test-ui-mode)

So far the tests do not allow to rum different browsers at the same time, since they use the same account dir which is

_packages/e2e-tests/data/accounts_
