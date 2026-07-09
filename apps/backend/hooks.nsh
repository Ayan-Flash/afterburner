!macro NSIS_HOOK_POSTINSTALL
  CreateShortcut "$DESKTOP\GPUControl Pro.lnk" "$INSTDIR\gpucontrol-pro-backend.exe"
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  Delete "$DESKTOP\GPUControl Pro.lnk"
!macroend
