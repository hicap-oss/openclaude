import React, { useMemo } from 'react'
import { useAppState } from 'src/state/AppState.js'
import { logError } from 'src/utils/log.js'
import { getOriginalCwd } from '../../../bootstrap/state.js'
import { Box, Text } from '../../../ink.js'
import { sanitizeToolNameForAnalytics } from '../../../services/analytics/metadata.js'
import { SKILL_TOOL_NAME } from '../../../tools/SkillTool/constants.js'
import { SkillTool } from '../../../tools/SkillTool/SkillTool.js'
import { env } from '../../../utils/env.js'
import { shouldShowAlwaysAllowOptions } from '../../../utils/permissions/permissionsLoader.js'
import { logUnaryEvent } from '../../../utils/unaryLogging.js'
import { usePermissionRequestLogging } from '../hooks.js'
import { PermissionDialog } from '../PermissionDialog.js'
import {
  PermissionPrompt,
  type PermissionPromptOption,
} from '../PermissionPrompt.js'
import type { PermissionRequestProps } from '../PermissionRequest.js'
import { PermissionRuleExplanation } from '../PermissionRuleExplanation.js'

type SkillOptionValue =
  | 'yes'
  | 'yes-exact'
  | 'yes-prefix'
  | 'yes-full-access'
  | 'no'

export function SkillPermissionRequest({
  toolUseConfirm,
  onDone,
  onReject,
  workerBadge,
}: PermissionRequestProps) {
  const isDangerousModeAvailable = useAppState(
    s => s.toolPermissionContext.isBypassPermissionsModeAvailable,
  )

  const skill = parseSkillInput(toolUseConfirm.input)
  const commandObj =
    toolUseConfirm.permissionResult.behavior === 'ask' &&
    toolUseConfirm.permissionResult.metadata &&
    'command' in toolUseConfirm.permissionResult.metadata
      ? toolUseConfirm.permissionResult.metadata.command
      : undefined

  usePermissionRequestLogging(toolUseConfirm, {
    completion_type: 'tool_use_single',
    language_name: 'none',
  })

  const handleSelect = (value: SkillOptionValue, feedback?: string) => {
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

      case 'yes-exact':
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
            rules: [{ toolName: SKILL_TOOL_NAME, ruleContent: skill }],
            behavior: 'allow',
            destination: 'localSettings',
          },
        ])
        onDone()
        return

      case 'yes-prefix': {
        logUnaryEvent({
          completion_type: 'tool_use_single',
          event: 'accept',
          metadata: {
            language_name: 'none',
            message_id: toolUseConfirm.assistantMessage.message.id,
            platform: env.platform,
          },
        })
        const spaceIndex = skill.indexOf(' ')
        const commandPrefix =
          spaceIndex > 0 ? skill.substring(0, spaceIndex) : skill
        toolUseConfirm.onAllow(toolUseConfirm.input, [
          {
            type: 'addRules',
            rules: [
              {
                toolName: SKILL_TOOL_NAME,
                ruleContent: `${commandPrefix}:*`,
              },
            ],
            behavior: 'allow',
            destination: 'localSettings',
          },
        ])
        onDone()
        return
      }

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
    const nextOptions: PermissionPromptOption<SkillOptionValue>[] = [
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
            Yes, and don&apos;t ask again for <Text bold>{skill}</Text> in{' '}
            <Text bold>{getOriginalCwd()}</Text>
          </Text>
        ),
        value: 'yes-exact',
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

      const spaceIndex = skill.indexOf(' ')
      if (spaceIndex > 0) {
        const commandPrefix = `${skill.substring(0, spaceIndex)}:*`
        nextOptions.push({
          label: (
            <Text>
              Yes, and don&apos;t ask again for <Text bold>{commandPrefix}</Text>{' '}
              commands in <Text bold>{getOriginalCwd()}</Text>
            </Text>
          ),
          value: 'yes-prefix',
        })
      }
    }

    nextOptions.push({
      label: 'No',
      value: 'no',
      feedbackConfig: { type: 'reject' },
    })

    return nextOptions
  }, [isDangerousModeAvailable, skill])

  const toolAnalyticsContext = {
    toolName: sanitizeToolNameForAnalytics(toolUseConfirm.tool.name),
    isMcp: toolUseConfirm.tool.isMcp ?? false,
  }

  return (
    <PermissionDialog title={`Use skill "${skill}"?`} workerBadge={workerBadge}>
      <Text>Claude may use instructions, code, or files from this Skill.</Text>
      {commandObj?.description ? (
        <Box flexDirection="column" paddingX={2} paddingY={1}>
          <Text dimColor>{commandObj.description}</Text>
        </Box>
      ) : null}
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

function parseSkillInput(input: unknown): string {
  const result = SkillTool.inputSchema.safeParse(input)

  if (!result.success) {
    logError(new Error(`Failed to parse skill tool input: ${result.error.message}`))
    return ''
  }

  return result.data.skill
}
