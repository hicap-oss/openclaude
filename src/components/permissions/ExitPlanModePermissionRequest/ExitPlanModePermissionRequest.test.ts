import { describe, expect, test } from 'bun:test'

import {
  buildPermissionUpdates,
  buildPlanApprovalOptions,
  getDangerousPlanExitMode,
} from './ExitPlanModePermissionRequest.tsx'

describe('getDangerousPlanExitMode', () => {
  test('restores fullAccess when plan mode was entered from fullAccess', () => {
    expect(
      getDangerousPlanExitMode({
        isBypassPermissionsModeAvailable: true,
        prePlanMode: 'fullAccess',
      }),
    ).toBe('fullAccess')
  })

  test('falls back to bypassPermissions for other dangerous sessions', () => {
    expect(
      getDangerousPlanExitMode({
        isBypassPermissionsModeAvailable: true,
        prePlanMode: 'bypassPermissions',
      }),
    ).toBe('bypassPermissions')
  })

  test('returns null when dangerous modes are unavailable', () => {
    expect(
      getDangerousPlanExitMode({
        isBypassPermissionsModeAvailable: false,
        prePlanMode: 'fullAccess',
      }),
    ).toBeNull()
  })
})

describe('buildPlanApprovalOptions', () => {
  test('labels fullAccess plan exits explicitly', () => {
    const options = buildPlanApprovalOptions({
      showClearContext: true,
      showUltraplan: false,
      usedPercent: 42,
      isAutoModeAvailable: false,
      dangerousPlanExitMode: 'fullAccess',
      planAuthorName: 'OpenClaude',
      onFeedbackChange: () => {},
    })

    expect(options[0]).toMatchObject({
      label: 'Yes, clear context (42% used) and full access',
      value: 'yes-bypass-permissions',
    })
    expect(options[1]).toMatchObject({
      label: 'Yes, and full access',
      value: 'yes-accept-edits-keep-context',
    })
  })
})

describe('buildPermissionUpdates', () => {
  test('preserves fullAccess when building session updates', () => {
    expect(buildPermissionUpdates('fullAccess')).toEqual([
      {
        type: 'setMode',
        mode: 'fullAccess',
        destination: 'session',
      },
    ])
  })
})
