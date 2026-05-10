import React from 'react'
import { BypassPermissionsModeDialog } from '../BypassPermissionsModeDialog.js'
import type { DangerousPermissionMode } from '../../utils/permissions/dangerousModePrompt.js'
import { getStartupDangerousPermissionPromptState } from '../../utils/permissions/dangerousModePromptRuntime.js'

export function useDangerousModeConfirmation() {
  const [pendingMode, setPendingMode] =
    React.useState<DangerousPermissionMode | null>(null)
  const continuationRef = React.useRef<(() => void) | null>(null)

  const clearPendingDangerousMode = React.useCallback(() => {
    continuationRef.current = null
    setPendingMode(null)
  }, [])

  const confirmDangerousMode = React.useCallback(
    (mode: DangerousPermissionMode, onConfirm: () => void) => {
      const promptState = getStartupDangerousPermissionPromptState({
        permissionMode: mode,
        allowDangerouslySkipPermissions: false,
      })

      if (!promptState.shouldShow || !promptState.mode) {
        onConfirm()
        return
      }

      continuationRef.current = onConfirm
      setPendingMode(promptState.mode)
    },
    [],
  )

  const handleDangerousModeAccept = React.useCallback(() => {
    const continuation = continuationRef.current
    continuationRef.current = null
    setPendingMode(null)
    continuation?.()
  }, [])

  const dangerousModeDialog = pendingMode ? (
    <BypassPermissionsModeDialog
      mode={pendingMode}
      onAccept={handleDangerousModeAccept}
      onDecline={clearPendingDangerousMode}
      onCancel={clearPendingDangerousMode}
    />
  ) : null

  return {
    confirmDangerousMode,
    dangerousModeDialog,
    isConfirmingDangerousMode: pendingMode !== null,
  }
}
