{
  "targets": [
    {
      "target_name": "deltachat",
      "conditions": [
        [ "OS == 'win'", {}],
        [ "OS == 'linux'", {
          "libraries": [
            "-L/opt/DeltaChat/libdeltachat/lib/x86_64-linux-gnu/",
            "-ldeltachat",
            "-lpthread"
          ],
          "cflags": [
            "-std=gnu99",
            "-I/opt/DeltaChat/libdeltachat/include",
          ]
        }],
        [ "OS == 'mac'", {
          "libraries": [
            "../deltachat-core/builddir/src/libdeltachat.a",
            "/usr/local/Cellar/libetpan/1.9.2_1/lib/libetpan.a",
            "../deltachat-core/builddir/libs/netpgp/libnetpgp.a",
            "-framework CoreFoundation",
            "-framework CoreServices",
            "-framework Security",
            "-lsasl2",
            "-lssl",
            "-lsqlite3",
            "-lpthread"
          ]
        }]
      ],
      "sources": [
        "./src/module.c",
        "./src/eventqueue.c",
        "./src/strtable.c"
      ],
      "include_dirs": [
        "deltachat-core/src",
        "<!(node -e \"require('napi-macros')\")"
      ]
    }
  ]
}
