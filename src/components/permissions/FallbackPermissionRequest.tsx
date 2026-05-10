import React, { useMemo } from 'react'
import { useAppState } from 'src/state/AppState.js'
import { getOriginalCwd } from '../../bootstrap/state.js'
import { Box, Text, useTheme } from '../../ink.js'
import { sanitizeToolNameForAnalytics } from '../../services/analytics/metadata.js'
import { env } from '../../utils/env.js'
import { shouldShowAlwaysAllowOptions } from '../../utils/permissions/permissionsLoader.js'
import { truncateToLines } from '../../utils/stringUtils.js'
import { logUnaryEvent } from '../../utils/unaryLogging.js'
import { usePermissionRequestLogging } from './hooks.js'
import { PermissionDialog } from './PermissionDialog.js'
import {
  PermissionPrompt,
  type PermissionPromptOption,
} from './PermissionPrompt.js'
import type { PermissionRequestProps } from './PermissionRequest.js'
import { PermissionRuleExplanation } from './PermissionRuleExplanation.js'

type FallbackOptionValue =
  | 'yes'
  | 'yes-dont-ask-again'
  | 'yes-full-access'
  | 'no'

export function FallbackPermissionRequest({
  toolUseConfirm,
  onDone,
  onReject,
  workerBadge,
}: PermissionRequestProps) {
  const [theme] = useTheme()
  const isDangerousModeAvailable = useAppState(
    s => s.toolPermissionContext.isBypassPermissionsModeAvailable,
  )

  const originalUserFacingName = toolUseConfirm.tool.userFacingName(
    toolUseConfirm.input as never,
  )
  const userFacingName = originalUserFacingName.endsWith(' (MCP)')
    ? originalUserFacingName.slice(0, -6)
    : originalUserFacingName

  usePermissionRequestLogging(toolUseConfirm, {
    completion_type: 'tool_use_single',
    language_name: 'none',
  })

  const handleSelect = (value: FallbackOptionValue, feedback?: string) => {
    switch (value) {
      case 'yes':
        logUnaryEvent({
          completion_type: 'tool_use_single',
          event: 'accept',
          metadata: {
            language_name: 'none',
            message_id: toolUseConfirm.assistantMessage.message.id,
            platform: env.platform,
          },
        })
        toolUseConfirm.onAllow(toolUseConfirm.input, [], feedback)
        onDone()
        return

      case 'yes-dont-ask-again':
        logUnaryEvent({
          completion_type: 'tool_use_single',
          event: 'accept',
          metadata: {
            language_name: 'none',
            message_id: toolUseConfirm.assistantMessage.message.id,
            platform: env.platform,
          },
        })
        toolUseConfirm.onAllow(toolUseConfirm.input, [
          {
            type: 'addRules',
            rules: [{ toolName: toolUseConfirm.tool.name }],
            behavior: 'allow',
            destination: 'localSettings',
          },
        ])
        onDone()
        return

      case 'yes-full-access':
        logUnaryEvent({
          completion_type: 'tool_use_single',
          event: 'accept',
          metadata: {
            language_name: 'none',
            message_id: toolUseConfirm.assistantMessage.message.id,
            platform: env.platform,
          },
        })
        toolUseConfirm.onAllow(toolUseConfirm.input, [
          {
            type: 'setMode',
            mode: 'fullAccess',
            destination: 'session',
          },
        ])
        onDone()
        return

      case 'no':
        logUnaryEvent({
          completion_type: 'tool_use_single',
          event: 'reject',
          metadata: {
            language_name: 'none',
            message_id: toolUseConfirm.assistantMessage.message.id,
            platform: env.platform,
          },
        })
        toolUseConfirm.onReject(feedback)
        onReject()
        onDone()
        return
    }
  }

  const handleCancel = () => {
    logUnaryEvent({
      completion_type: 'tool_use_single',
      event: 'reject',
      metadata: {
        language_name: 'none',
        message_id: toolUseConfirm.assistantMessage.message.id,
        platform: env.platform,
      },
    })
    toolUseConfirm.onReject()
    onReject()
    onDone()
  }

  const options = useMemo(() => {
    const nextOptions: PermissionPromptOption<FallbackOptionValue>[] = [
      {
        label: 'Yes',
        value: 'yes',
        feedbackConfig: { type: 'accept' },
      },
    ]

    if (shouldShowAlwaysAllowOptions()) {
      nextOptions.push({
        label: (
          <Text>
            Yes, and don&apos;t ask again for{' '}
            <Text bold>{userFacingName}</Text> commands in{' '}
            <Text bold>{getOriginalCwd()}</Text>
          </Text>
        ),
        value: 'yes-dont-ask-again',
      })

      if (isDangerousModeAvailable) {
        nextOptions.push({
          label: (
            <Text color="error">
              Yes, and enable Full Access for this session
            </Text>
          ),
          value: 'yes-full-access',
          dangerousMode: 'fullAccess',
        })
      }
    }

    nextOptions.push({
      label: 'No',
      value: 'no',
      feedbackConfig: { type: 'reject' },
    })

    return nextOptions
  }, [isDangerousModeAvailable, userFacingName])

  const toolAnalyticsContext = {
    toolName: sanitizeToolNameForAnalytics(toolUseConfirm.tool.name),
    isMcp: toolUseConfirm.tool.isMcp ?? false,
  }

  const toolMessage = toolUseConfirm.tool.renderToolUseMessage(
    toolUseConfirm.input as never,
    {
      theme,
      verbose: true,
    },
  )

  const mcpSuffix = originalUserFacingName.endsWith(' (MCP)') ? (
    <Text dimColor> (MCP)</Text>
  ) : (
    ''
  )

  return (
    <PermissionDialog title="Tool use" workerBadge={workerBadge}>
      <Box flexDirection="column" paddingX={2} paddingY={1}>
        <Text>
          {userFacingName}({toolMessage})
          {mcpSuffix}
        </Text>
        <Text dimColor>{truncateToLines(toolUseConfirm.description, 3)}</Text>
      </Box>
      <Box flexDirection="column">
        <PermissionRuleExplanation
          permissionResult={toolUseConfirm.permissionResult}
          toolType="tool"
        />
        <PermissionPrompt
          options={options}
          onSelect={handleSelect}
          onCancel={handleCancel}
          toolAnalyticsContext={toolAnalyticsContext}
        />
      </Box>
    </PermissionDialog>
  )
}
