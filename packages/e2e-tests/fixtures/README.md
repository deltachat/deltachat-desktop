`dummy-account-backup.tar` is a backup of a fresh Chatmail account
created on Core v2.49.0, with profile name 'Alice',
with email set to `alice@localhost` (which is not supposed to work)
and the device chat deleted (to save space on images).

`webxdc-test-app.xdc` is packed from the sources in `webxdc-test-app/`.
After changing them, rebuild it with:

```sh
cd webxdc-test-app && rm -f ../webxdc-test-app.xdc && zip -X -D ../webxdc-test-app.xdc *
```
