import { useMemo } from 'react'
import { useDebounce } from 'use-debounce'

import { BackendRemote } from '../backend-com'
import { useRpcFetch } from './useFetch'
import useTranslationFunction from './useTranslationFunction'

import type { T } from '@deltachat/jsonrpc-client'

/**
 * If a QR code / URI is pasted to the search field
 * that can be processed we display it as a search result
 */
export type QrSearchResult = {
  /** The query itself, to be passed to `useProcessQr` when the user clicks. */
  qrContent: string
} & (
  | { type: 'contact'; contact: T.Contact }
  | {
      type: 'pseudo'
      /** Element id and test id of the list item. */
      id: string
      text: string
      subText: string
      qrAvatar?: true
    }
)

/**
 * Don't call `checkQr` on every keystroke
 * URLs are probably pasted anyway
 */
const DEBOUNCE_MS = 300

/**
 * Checks whether the search query is a QR code / URI that offers an action,
 * such as an invite link, and returns how to present it as a search result.
 *
 * Note that `checkQr` creates a hidden contact for URIs containing an address.
 */
export default function useQrSearchResult(
  accountId: number,
  queryStr: string
): QrSearchResult | null {
  const tx = useTranslationFunction()

  const query = queryStr.trim()
  const [debouncedQuery] = useDebounce(query, DEBOUNCE_MS)
  // Only act on a query that has settled. Comparing the two also makes
  // the result disappear the moment the query changes again.
  //
  // All the URI schemes we can act on contain a colon,
  // which keeps `checkQr` away from ordinary search queries.
  const isPossiblyQr = debouncedQuery === query && query.includes(':')

  const qrFetch = useRpcFetch(
    BackendRemote.rpc.checkQr,
    isPossiblyQr ? [accountId, query] : null
  )
  const qr = qrFetch?.result?.ok ? qrFetch.result.value : null

  const contactId =
    qr != null &&
    (qr.kind === 'askVerifyContact' ||
      qr.kind === 'fprOk' ||
      qr.kind === 'addr')
      ? qr.contact_id
      : null
  const contactFetch = useRpcFetch(
    BackendRemote.rpc.getContact,
    contactId != null ? [accountId, contactId] : null
  )
  const contact = contactFetch?.result?.ok ? contactFetch.result.value : null

  return useMemo(() => {
    if (qr == null) {
      return null
    }
    if (contact != null) {
      return { type: 'contact', qrContent: query, contact }
    }

    const pseudo = (
      id: string,
      text: string,
      subText: string,
      qrAvatar?: true
    ): QrSearchResult => ({
      type: 'pseudo',
      qrContent: query,
      id,
      text,
      subText,
      qrAvatar,
    })

    switch (qr.kind) {
      case 'askVerifyGroup':
        return pseudo('newgroupfrominvitelink', qr.grpname, tx('join_group'))
      case 'askJoinBroadcast':
        return pseudo('newbroadcastfrominvitelink', qr.name, tx('join_channel'))
      case 'account':
        return pseudo('addtransportfromqr', qr.domain, tx('add_transport'))
      case 'login':
        return pseudo('addtransportfromqr', qr.address, tx('add_transport'))
      case 'proxy':
        return pseudo('useproxyfromqr', qr.host, tx('proxy_use_proxy'))
      // The remaining kinds offer nothing useful to do with them here
      default:
        return null
    }
  }, [contact, qr, query, tx])
}
