import React from 'react'
import type { Root } from '../../ink.js'
import { BypassPermissionsModeDialog } from '../../components/BypassPermissionsModeDialog.js'
import type { PermissionMode } from './PermissionMode.js'
import {
  getStartupDangerousPermissionPromptState,
  persistDangerousModeAcceptance,
} from './dangerousModePromptRuntime.js'

export async function showDangerousModePromptIfNeeded(
  root: Root,
  permissionMode: PermissionMode,
  allowDangerouslySkipPermissions: boolean,
  showSetupDialog: <T = void>(
    root: Root,
    renderer: (done: (result: T) => void) => React.ReactNode,
  ) => Promise<T>,
): Promise<boolean> {
  const dangerousPromptState = getStartupDangerousPermissionPromptState({
    permissionMode,
    allowDangerouslySkipPermissions,
  })

  if (!dangerousPromptState.shouldShow || !dangerousPromptState.mode) {
    return false
  }

  await showSetupDialog(root, done => (
    <BypassPermissionsModeDialog
      mode={dangerousPromptState.mode}
      onAccept={() => {
        persistDangerousModeAcceptance(dangerousPromptState.mode!)
        done()
      }}
    />
  ))
  return true
}
