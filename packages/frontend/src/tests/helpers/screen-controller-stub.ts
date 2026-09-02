// Stand-in for src/ScreenController.tsx in unit tests, swapped in by
// bin/test-loader.mjs. The real module pulls in the entire component tree;
// the store code under test only needs `selectedAccountId`.
// Use `setSelectedAccountId` from test-env.ts to control the value.

export function selectedAccountId(): number {
  const selectedAccountId = window.__selectedAccountId
  if (selectedAccountId === undefined) {
    throw new Error('no context selected')
  }
  return selectedAccountId
}
