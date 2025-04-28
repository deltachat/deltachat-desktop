;  Runs before copying files, setting registry key values and creating shortcuts.
!macro NSIS_HOOK_PREINSTALL
;   MessageBox MB_OK "PreInstall"
!macroend

; Runs after the installer has finished copying all files, setting the registry keys and created shortcuts.
!macro NSIS_HOOK_POSTINSTALL
;   MessageBox MB_OK "PostInstall"
    !insertmacro APP_ASSOCIATE "xdc" "chat.delta.tauri.webxdc" "open" "$INSTDIR\xdc.ico" "Share App with ${PRODUCTNAME}" "$INSTDIR\deltachat-tauri.exe $\"%1$\""
!macroend

; Runs before removing any files, registry keys and shortcuts.
!macro NSIS_HOOK_PREUNINSTALL
;   MessageBox MB_OK "PreUnInstall"
    !insertmacro APP_UNASSOCIATE "xdc" "chat.delta.tauri.webxdc"
!macroend

; Runs after files, registry keys and shortcuts have been removed.
!macro NSIS_HOOK_POSTUNINSTALL
;   MessageBox MB_OK "PostUninstall"
!macroend