import { describe, expect, test } from 'bun:test'

import {
  applyPermissionUpdatesToLiveContext,
  getDangerousPermissionModeTransitionError,
  getEffectiveDefaultPermissionModeFromSettingsSources,
} from './permissionSetup.js'

describe('getEffectiveDefaultPermissionModeFromSettingsSources', () => {
  test('ignores dangerous default modes from shared project settings', () => {
    const mode = getEffectiveDefaultPermissionModeFromSettingsSources([
      {
        source: 'projectSettings',
        settings: {
          permissions: {
            defaultMode: 'fullAccess',
          },
        },
      },
    ])

    expect(mode).toBeUndefined()
  })

  test('still honors dangerous default modes from trusted sources', () => {
    const mode = getEffectiveDefaultPermissionModeFromSettingsSources([
      {
        source: 'projectSettings',
        settings: {
          permissions: {
            defaultMode: 'fullAccess',
          },
        },
      },
      {
        source: 'localSettings',
        settings: {
          permissions: {
            defaultMode: 'fullAccess',
          },
        },
      },
    ])

    expect(mode).toBe('fullAccess')
  })

  test('preserves non-dangerous project default modes', () => {
    const mode = getEffectiveDefaultPermissionModeFromSettingsSources([
      {
        source: 'projectSettings',
        settings: {
          permissions: {
            defaultMode: 'plan',
          },
        },
      },
    ])

    expect(mode).toBe('plan')
  })
})

describe('getDangerousPermissionModeTransitionError', () => {
  test('rejects remote dangerous-mode activation until the user confirms locally', async () => {
    const error = await getDangerousPermissionModeTransitionError({
      mode: 'fullAccess',
      toolPermissionContext: {
        isBypassPermissionsModeAvailable: true,
      },
      deps: {
        getStartupDangerousPermissionPromptState: () => ({
          mode: 'fullAccess',
          shouldShow: true,
        }),
        shouldDisableBypassPermissions: async () => false,
      },
    })

    expect(error).toBe(
      'Cannot set permission mode to fullAccess until the user explicitly confirms Full Access in a local interactive session',
    )
  })

  test('uses the authoritative org gate for later dangerous-mode entry', async () => {
    const error = await getDangerousPermissionModeTransitionError({
      mode: 'bypassPermissions',
      toolPermissionContext: {
        isBypassPermissionsModeAvailable: true,
      },
      deps: {
        getStartupDangerousPermissionPromptState: () => ({
          mode: 'bypassPermissions',
          shouldShow: false,
        }),
        shouldDisableBypassPermissions: async () => true,
      },
    })

    expect(error).toBe(
      'Cannot set permission mode to bypassPermissions because it is disabled by your organization policy',
    )
  })

  test('can skip the local prompt check for trusted delegated transitions', async () => {
    const error = await getDangerousPermissionModeTransitionError({
      mode: 'fullAccess',
      toolPermissionContext: {
        isBypassPermissionsModeAvailable: true,
      },
      requireLocalConfirmation: false,
      deps: {
        getStartupDangerousPermissionPromptState: () => ({
          shouldShow: true,
          mode: 'fullAccess',
        }),
        shouldDisableBypassPermissions: async () => false,
      },
    })

    expect(error).toBeUndefined()
  })
})

describe('applyPermissionUpdatesToLiveContext', () => {
  test('routes setMode updates through the live transition flow', () => {
    const updated = applyPermissionUpdatesToLiveContext(
      {
        mode: 'plan',
        prePlanMode: 'acceptEdits',
      } as never,
      [{ type: 'setMode', mode: 'default', destination: 'session' }],
    )

    expect(updated.mode).toBe('default')
    expect(updated.prePlanMode).toBeUndefined()
  })
})
