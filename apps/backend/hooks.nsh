!macro NSIS_HOOK_PREINSTALL
  DetailPrint "Pre-install: checking for running instances..."
  nsExec::ExecToStack 'tasklist /FI "IMAGENAME eq gpucontrol-pro-backend.exe" /NH'
  Pop $0
  ${If} $0 == 0
    DetailPrint "GPUControl Pro is running - attempting graceful shutdown..."
    nsExec::ExecToStack 'taskkill /IM "gpucontrol-pro-backend.exe" /F'
    Pop $0
    Sleep 1000
  ${EndIf}

  ; Store previous version for rollback
  ReadRegStr $R5 HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\GPUControl Pro" "DisplayVersion"
  ${If} $R5 != ""
    WriteRegStr HKCU "Software\gpucontrol\GPUControl Pro" "PreviousVersion" $R5
  ${EndIf}
!macroend

!macro NSIS_HOOK_POSTINSTALL
  CreateShortcut "$DESKTOP\GPUControl Pro.lnk" "$INSTDIR\gpucontrol-pro-backend.exe"

  ; Set up auto-start on login for update checks
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "GPUControl Pro" "$\"$INSTDIR\gpucontrol-pro-backend.exe$\" --minimized"

  ; Write install timestamp for update tracking
  StrCpy $0 "INSTALL_TIMESTAMP"
  WriteRegStr HKCU "Software\gpucontrol\GPUControl Pro" "InstallTimestamp" "$0"

  ; If this was an update (/UPDATE flag), auto-restart the app
  ${If} $UpdateMode = 1
    DetailPrint "Update complete - restarting application..."
    Exec '"$INSTDIR\gpucontrol-pro-backend.exe"'
  ${EndIf}
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  DetailPrint "Pre-uninstall: stopping application..."
  nsExec::ExecToStack 'taskkill /IM "gpucontrol-pro-backend.exe" /F'
  Pop $0
  Sleep 500
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  Delete "$DESKTOP\GPUControl Pro.lnk"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "GPUControl Pro"
!macroend
