// validation of ipc requests
// https://tauri.app/concept/inter-process-communication/isolation

window.__TAURI_ISOLATION_HOOK__ = payload => {
  // let's not verify or modify anything, just print the content from the hook
  console.log('hook', payload)
  return payload
}
