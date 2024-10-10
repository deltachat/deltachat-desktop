# Browser Target of Deltachat desktop

For now this is only meant for development and debugging the frontend.
So not all features will work. It is not meant for end users.

> Future ideas:
>
> In the future someone could porbably use this to make a deltachat webclient that could use the deltachat installation on android for example.
>
> You could even host it on a raspberry pi in your local network or on your homeserver and connect to it from every device.

## How to use this

### Generate your own self signed certifacate

Install `rust` over [rustup.rs](https://rustup.rs) and then `cargo install rustls-cert-gen`.

Then run this to generate a self signed certificate:

```sh
rustls-cert-gen -o data/certificate
```

> It's important to use HTTPS, otherwise the communication between backend and frontend is not encrypted/protected,

### After that you can start the server with this:

Linux / MacOS:

```sh
WEB_PASSWORD="my_passwort" pnpm run start
```

Windows (Powershell):

```pwsh
$env:WEB_PASSWORD="my_passwort"
pnpm run start
```

Then point your browser to <https://localhost:3000> and acept the locally signed certificate to continue.

> If you get an "The connection was reset"-Error, then you have likely forgotten to use http**s** instead of http.

### Known broken things

> Image Cropper is broken because accesing tmp files directly isn't implemented. Suggestion: handle image preview in cache or memory.
