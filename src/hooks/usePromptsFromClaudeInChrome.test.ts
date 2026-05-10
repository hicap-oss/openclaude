import { describe, expect, test } from 'bun:test'

import { getClaudeInChromePermissionMode } from './usePromptsFromClaudeInChrome.tsx'

describe('getClaudeInChromePermissionMode', () => {
  test('maps both dangerous modes to skip-all permission checks', () => {
    expect(getClaudeInChromePermissionMode('bypassPermissions')).toBe(
      'skip_all_permission_checks',
    )
    expect(getClaudeInChromePermissionMode('fullAccess')).toBe(
      'skip_all_permission_checks',
    )
  })

  test('keeps non-dangerous modes in ask mode', () => {
    expect(getClaudeInChromePermissionMode('default')).toBe('ask')
    expect(getClaudeInChromePermissionMode('acceptEdits')).toBe('ask')
    expect(getClaudeInChromePermissionMode('plan')).toBe('ask')
    expect(getClaudeInChromePermissionMode('dontAsk')).toBe('ask')
  })
})
