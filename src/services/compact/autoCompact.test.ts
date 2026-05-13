import { describe, expect, test } from 'bun:test'
import {
  getEffectiveContextWindowSize,
  getAutoCompactThreshold,
} from './autoCompact.ts'

const SAVED_ENV = {
  CLAUDE_CODE_USE_OPENAI: process.env.CLAUDE_CODE_USE_OPENAI,
  MINIMAX_API_KEY: process.env.MINIMAX_API_KEY,
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
}

function restoreEnv(): void {
  for (const [key, value] of Object.entries(SAVED_ENV)) {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
}

describe('getEffectiveContextWindowSize', () => {
  test('returns positive value for known models with large context windows', () => {
    // claude-sonnet-4 has 200k context
    const effective = getEffectiveContextWindowSize('claude-sonnet-4')
    expect(effective).toBeGreaterThan(0)
  })

  test('never returns negative even for unknown 3P models (issue #635)', () => {
    // Previously, unknown 3P models got 8k context → effective context was
    // 8k minus 20k summary reservation = -12k, causing infinite auto-compact.
    // Now the fallback is 128k and there's a floor, so effective is always
    // at least reservedTokensForSummary + buffer.
    //
    // The exact floor depends on the max-output-tokens slot-reservation cap
    // (tengu_otk_slot_v1 GrowthBook flag). With cap enabled, the model's
    // default output cap drops to CAPPED_DEFAULT_MAX_TOKENS (8k), so the
    // summary reservation is 8k and the floor is 8k + 13k = 21k. With cap
    // disabled it's 20k + 13k = 33k. Assert the worst case so the test is
    // stable regardless of flag state in CI vs local.
    process.env.CLAUDE_CODE_USE_OPENAI = '1'
    try {
      const effective = getEffectiveContextWindowSize('some-unknown-3p-model')
      expect(effective).toBeGreaterThan(0)
      // 21k = CAPPED_DEFAULT_MAX_TOKENS (8k) + AUTOCOMPACT_BUFFER_TOKENS (13k).
      // Covers the anti-regression intent of issue #635 without assuming
      // the GrowthBook flag state.
      expect(effective).toBeGreaterThanOrEqual(21_000)
    } finally {
      restoreEnv()
    }
  })

  test('uses MiniMax M2 context and output metadata for compact budget', () => {
    process.env.MINIMAX_API_KEY = 'minimax-test'
    process.env.OPENAI_MODEL = 'MiniMax-M2.7'

    try {
      // MiniMax's recommended Anthropic-compatible endpoint supports the full
      // M2 window. Compact reserves at most 20k summary output tokens.
      expect(getEffectiveContextWindowSize('MiniMax-M2.7')).toBe(184_800)
    } finally {
      restoreEnv()
    }
  })
})

describe('getAutoCompactThreshold', () => {
  test('returns positive threshold for known models', () => {
    const threshold = getAutoCompactThreshold('claude-sonnet-4')
    expect(threshold).toBeGreaterThan(0)
  })

  test('never returns negative threshold even for unknown 3P models (issue #635)', () => {
    process.env.CLAUDE_CODE_USE_OPENAI = '1'
    try {
      const threshold = getAutoCompactThreshold('some-unknown-3p-model')
      expect(threshold).toBeGreaterThan(0)
    } finally {
      restoreEnv()
    }
  })
})
