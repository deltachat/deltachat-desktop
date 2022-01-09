# APPX testing & signing

To test appx packages you need to sign them.

> You need the windows sdk in your `PATH` env variable that windows can find `MakeCert.exe` and `pvk2pfx.exe`

First generate a certificate with these steps:
1. run `MakeCert.exe -r -h 0 -n "CN=C13753E5-D590-467C-9FCA-6799E1A5EC1E" -eku 1.3.6.1.5.5.7.3.3 -pe -sv ../my.pvk ../my.cer` in the dialog select None. (the cn is the publisher id (`appx.publisher`) specified in `electron-builder.json5`)
2. run `pvk2pfx.exe -pvk ../my.pvk -spc ../my.cer -pfx ../my.pfx`

Now you have a certificate with which you can package a self-signed appx:
```
npm run build && npx electron-builder --config ./electron-builder.json5 --config.win.certificateFile=../my.pfx --win
```

To install your self-signed appx, you first need to import it: double click on the certificate and install it into the **Trusted People** store. After that you should be able to double click the appx package in the `dist/` folder to install it.
