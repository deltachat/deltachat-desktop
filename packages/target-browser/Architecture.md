# Architecture

## Endpoints

```sh
/                                       # -> serves the app or login screen
/authenticate
/logout
# Authenticated session only
/blobs/:accountId/:filename
/stickers/:account/:?pack/:filename     # todo
/ws/dc                                  # deltachat jsonrpc
/ws/backend                             # runtime notifications (backend notifies frontend or other way around -> things like open_url or logging)
/backend-api                            #runtime functions with results like RC_CONFIG
```
