### Logging

#### Logging Options

Debug messages are disabled by default, enable them with the `--log-debug` flag.

| Flag                            | Effect                                        |
| ------------------------------- | --------------------------------------------- |
| `--log-debug`                   | Log debug messages                            |
| `--log-to-console`              | Output the log to stdout / Chrome dev console |
| `--machine-readable-stacktrace` | Enable JSON stack trace                       |
| `--no-color`                    | Disable colors in the output of main process  |

> as of 1.21.0 `--devmode` enables both `--log-debug` and `--log-to-console` (formerly `--debug`)
> ~as of 1.3.0 `--debug` enables both `--log-debug` and `--log-to-console`~

#### Log locations

The logs can be found in:

```
Linux: ~/.config/DeltaChat/logs/
Mac: ~/Library/Application\ Support/DeltaChat/logs
```

You can also access the log folder and the current log file under the `View->Developer` menu:

<center><img src="../README_ASSETS/devMenu.png"/></center>

##### Format

The log files have the extension `.log`, the file name represents the point in time the log started.
Basically the log files are **tab separated** `CSV`-files(also known as `TSV`):

```
"2019-01-27T13:46:31.801Z"	"main/deltachat"	"INFO"	[]	"dc_get_info"
```

| timestamp                  | location / module | level  | stacktrace | arg1          | arg2 | ... |
| -------------------------- | ----------------- | ------ | ---------- | ------------- | ---- | --- |
| "2019-01-27T13:46:31.801Z" | "main/deltachat"  | "INFO" | \[]        | "dc_get_info" | -    | ... |

#### Tips and Tricks for working with the browser console:

##### Use the search to filter the output like:

space seperate terms, exclude with -, if your term contains spaces you should exape it with "

`-👻` - don't show events from background accounts (not selected accounts)
`-📡` - don't show any events
`-[JSONRPC]` - don't show jsonrpc messages
`[JSONRPC]` - show only jsonrpc messages

Start deltachat with --devmode (or --log-debug and --log-to-console) argument to show full log output.
