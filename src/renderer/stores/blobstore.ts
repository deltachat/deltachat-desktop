import { C } from '@deltachat/jsonrpc-client'
import { selectedAccountId } from '../ScreenController'

class BlobStore {
  private _store: Map<string, Blob>

  constructor() {
    this._store = new Map()
  }

  load(this: BlobStore, url: string) {
    C.getHttpResponse(selectedAccountId(), url).then((response) => {
      this._store.set(url, new Blob(btoa(response.blob)))
    });
  }

  get(this: BlobStore, url: string) : Blob | null {
    let b = this._store.get(url)
    return b ? b : null
  }
}

let blobStore = new BlobStore()

export default blobStore;
