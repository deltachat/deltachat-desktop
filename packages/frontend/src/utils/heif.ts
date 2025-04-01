import type libheif_init_type from 'libheif-js/libheif-wasm/libheif'
import libheif_init from './libheif'

export let libheif: ReturnType<typeof libheif_init_type> | null = null

export async function initLibHeif(path_to_wasm: string) {
  const wasmBinary = await (await fetch(path_to_wasm)).arrayBuffer()
  libheif = libheif_init({ wasmBinary })
}
