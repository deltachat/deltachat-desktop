!macro URI_SCHEME protocol
    WriteRegStr SHCTX "Software\Classes\\${protocol}" "URL Protocol" ""
    WriteRegStr SHCTX "Software\Classes\\${protocol}" "" "URL:${BUNDLEID} protocol"
    WriteRegStr SHCTX "Software\Classes\\${protocol}\DefaultIcon" "" "$\"$INSTDIR\${MAINBINARYNAME}.exe$\",0"
    WriteRegStr SHCTX "Software\Classes\\${protocol}\shell\open\command" "" "$\"$INSTDIR\${MAINBINARYNAME}.exe$\" $\"%1$\""
!macroend

!macro REMOVE_URI_SCHEME protocol
    DeleteRegKey SHCTX "Software\Classes\\${protocol}"
!macroend


;  Runs before copying files, setting registry key values and creating shortcuts.
!macro NSIS_HOOK_PREINSTALL
;   MessageBox MB_OK "PreInstall"
!macroend

; Runs after the installer has finished copying all files, setting the registry keys and created shortcuts.
!macro NSIS_HOOK_POSTINSTALL
;   MessageBox MB_OK "PostInstall"
    !insertmacro APP_ASSOCIATE "xdc" "chat.delta.tauri.webxdc" "open" "$INSTDIR\xdc.ico" "Share App with ${PRODUCTNAME}" "$INSTDIR\deltachat-tauri.exe $\"%1$\""

    !insertmacro URI_SCHEME "openpgp4fpr"
    !insertmacro URI_SCHEME "dcaccount"
    !insertmacro URI_SCHEME "dclogin"
!macroend

; Runs before removing any files, registry keys and shortcuts.
!macro NSIS_HOOK_PREUNINSTALL
;   MessageBox MB_OK "PreUnInstall"
    !insertmacro APP_UNASSOCIATE "xdc" "chat.delta.tauri.webxdc"

    !insertmacro REMOVE_URI_SCHEME "openpgp4fpr"
    !insertmacro REMOVE_URI_SCHEME "dcaccount"
    !insertmacro REMOVE_URI_SCHEME "dclogin"
!macroend

; Runs after files, registry keys and shortcuts have been removed.
!macro NSIS_HOOK_POSTUNINSTALL
;   MessageBox MB_OK "PostUninstall"
!macroend