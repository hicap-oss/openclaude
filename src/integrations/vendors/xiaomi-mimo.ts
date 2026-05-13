import { defineVendor } from '../define.js'

export default defineVendor({
  id: 'xiaomi-mimo',
  label: 'Xiaomi MiMo',
  classification: 'openai-compatible',
  defaultBaseUrl: 'https://api.xiaomimimo.com/v1',
  defaultModel: 'mimo-v2.5-pro',
  requiredEnvVars: ['MIMO_API_KEY'],
  setup: {
    requiresAuth: true,
    authMode: 'api-key',
    credentialEnvVars: ['MIMO_API_KEY'],
  },
  transportConfig: {
    kind: 'openai-compatible',
    openaiShim: {
      defaultAuthHeader: {
        name: 'api-key',
        scheme: 'raw',
      },
      preserveReasoningContent: true,
      requireReasoningContentOnAssistantMessages: true,
      reasoningContentFallback: '',
      maxTokensField: 'max_completion_tokens',
      supportsApiFormatSelection: false,
      supportsAuthHeaders: false,
    },
  },
  preset: {
    id: 'xiaomi-mimo',
    description: 'Xiaomi MiMo OpenAI-compatible endpoint',
    label: 'Xiaomi MiMo',
    name: 'Xiaomi MiMo',
    apiKeyEnvVars: ['MIMO_API_KEY'],
    modelEnvVars: ['MIMO_MODEL', 'OPENAI_MODEL'],
  },
  validation: {
    kind: 'credential-env',
    routing: {
      matchDefaultBaseUrl: true,
      matchBaseUrlHosts: ['api.xiaomimimo.com'],
    },
    credentialEnvVars: ['MIMO_API_KEY', 'OPENAI_API_KEY'],
    missingCredentialMessage:
      'Xiaomi MiMo auth is required. Set MIMO_API_KEY or OPENAI_API_KEY.',
  },
  catalog: {
    source: 'static',
    models: [
      {
        id: 'mimo-v2.5-pro',
        apiName: 'mimo-v2.5-pro',
        label: 'MiMo V2.5 Pro',
        contextWindow: 1_000_000,
        maxOutputTokens: 128_000,
        capabilities: {
          supportsStreaming: true,
          supportsFunctionCalling: true,
          supportsJsonMode: true,
          supportsReasoning: true,
        },
      },
      {
        id: 'mimo-v2-pro',
        apiName: 'mimo-v2-pro',
        label: 'MiMo V2 Pro',
        contextWindow: 1_000_000,
        maxOutputTokens: 128_000,
        capabilities: {
          supportsStreaming: true,
          supportsFunctionCalling: true,
          supportsJsonMode: true,
          supportsReasoning: true,
        },
      },
      {
        id: 'mimo-v2.5',
        apiName: 'mimo-v2.5',
        label: 'MiMo V2.5',
        contextWindow: 1_000_000,
        maxOutputTokens: 128_000,
        capabilities: {
          supportsStreaming: true,
          supportsFunctionCalling: true,
          supportsJsonMode: true,
          supportsReasoning: true,
          supportsVision: true,
        },
      },
      {
        id: 'mimo-v2-omni',
        apiName: 'mimo-v2-omni',
        label: 'MiMo V2 Omni',
        contextWindow: 256_000,
        maxOutputTokens: 128_000,
        capabilities: {
          supportsStreaming: true,
          supportsFunctionCalling: true,
          supportsJsonMode: true,
          supportsReasoning: true,
          supportsVision: true,
        },
      },
      {
        id: 'mimo-v2-flash',
        apiName: 'mimo-v2-flash',
        label: 'MiMo V2 Flash',
        contextWindow: 256_000,
        maxOutputTokens: 64_000,
        capabilities: {
          supportsStreaming: true,
          supportsFunctionCalling: true,
          supportsJsonMode: true,
          supportsReasoning: true,
        },
      },
    ],
  },
  usage: { supported: false },
})
