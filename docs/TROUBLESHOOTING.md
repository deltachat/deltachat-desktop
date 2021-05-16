# Troubleshooting For Users

This document describes common problems that are encountered by users and their solution.
Only end-user related stuff should be documented here, development related content should be written somewhere else.

## AppImage has missing dependencies on Ubuntu Server 18

Installing the following dependencies made it work for the user that had this problem:

```sh
sudo apt-get install -y libgdk-pixbuf2.0-dev libnss3 libgtk-3-dev libasound2-dev build-essential
```

see https://github.com/deltachat/deltachat-desktop/issues/1590 for the original issue this was reported to
