import { afterEach, expect, test } from 'bun:test'
import { getUserAgent } from './http.js'

const originalMacro = (globalThis as Record<string, unknown>).MACRO
const originalEnv = {
  USER_TYPE: process.env.USER_TYPE,
  CLAUDE_CODE_ENTRYPOINT: process.env.CLAUDE_CODE_ENTRYPOINT,
}

afterEach(() => {
  ;(globalThis as Record<string, unknown>).MACRO = originalMacro
  if (originalEnv.USER_TYPE === undefined) {
    delete process.env.USER_TYPE
  } else {
    process.env.USER_TYPE = originalEnv.USER_TYPE
  }
  if (originalEnv.CLAUDE_CODE_ENTRYPOINT === undefined) {
    delete process.env.CLAUDE_CODE_ENTRYPOINT
  } else {
    process.env.CLAUDE_CODE_ENTRYPOINT = originalEnv.CLAUDE_CODE_ENTRYPOINT
  }
})

test('uses VERSION for API client user agent compatibility', () => {
  ;(globalThis as Record<string, unknown>).MACRO = {
    VERSION: '99.0.0',
    DISPLAY_VERSION: '0.7.0',
  }
  process.env.USER_TYPE = 'test-user'
  process.env.CLAUDE_CODE_ENTRYPOINT = 'cli'

  expect(getUserAgent()).toContain('claude-cli/99.0.0')
  expect(getUserAgent()).not.toContain('claude-cli/0.7.0')
})
