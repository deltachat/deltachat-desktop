// it lets other scripts register callbacks that are called once everything is ready
// for stuff like listening for global events outside of react components like in the chat store

let callbacks: (() => void)[] = []

/** make sure this is run when all mentioned variables are availible */
export function onReady(cb: () => void) {
  callbacks.push(cb)
}

export function runPostponedFunctions() {
  const todo = [...callbacks]
  callbacks = []
  todo.forEach(cb => setTimeout(cb, 0))
}
