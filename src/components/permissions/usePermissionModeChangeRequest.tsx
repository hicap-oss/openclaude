import React from 'react'
import type { ToolPermissionContext } from '../../Tool.js'
import type { PermissionMode } from '../../utils/permissions/PermissionMode.js'
import { getPermissionModeChangeRequestDecision } from '../../utils/permissions/permissionSetup.js'
import { useDangerousModeConfirmation } from './useDangerousModeConfirmation.js'

type PermissionModeChangeRequest = {
  mode: PermissionMode
  toolPermissionContext: Pick<
    ToolPermissionContext,
    'isBypassPermissionsModeAvailable'
  >
  onApply: () => void
  onBlocked?: (error: string) => void
  allowDangerousModeConfirmation?: boolean
  skipDangerousModePrompt?: boolean
  requireLocalConfirmation?: boolean
}

export function usePermissionModeChangeRequest() {
  const {
    dangerousModeDialog,
    isConfirmingDangerousMode,
    requestDangerousModeConfirmation,
  } = useDangerousModeConfirmation()

  const requestPermissionModeChange = React.useCallback(
    async ({
      mode,
      toolPermissionContext,
      onApply,
      onBlocked,
      allowDangerousModeConfirmation = true,
      skipDangerousModePrompt = false,
      requireLocalConfirmation,
    }: PermissionModeChangeRequest): Promise<boolean> => {
      const modeDecision = await getPermissionModeChangeRequestDecision({
        mode,
        toolPermissionContext,
        allowDangerousModeConfirmation,
        skipDangerousModePrompt,
        requireLocalConfirmation,
      })

      if (modeDecision.status === 'blocked') {
        onBlocked?.(modeDecision.error)
        return false
      }

      if (modeDecision.status === 'confirm') {
        requestDangerousModeConfirmation(modeDecision.mode, () => {
          void requestPermissionModeChange({
            mode,
            toolPermissionContext,
            onApply,
            onBlocked,
            allowDangerousModeConfirmation,
            skipDangerousModePrompt: true,
            requireLocalConfirmation,
          })
        })
        return false
      }

      onApply()
      return true
    },
    [requestDangerousModeConfirmation],
  )

  return {
    dangerousModeDialog,
    isConfirmingDangerousMode,
    requestPermissionModeChange,
  }
}
