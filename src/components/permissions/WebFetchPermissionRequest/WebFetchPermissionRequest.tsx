import React, { useMemo } from 'react'
import { useAppState } from 'src/state/AppState.js'
import { Box, Text, useTheme } from '../../../ink.js'
import { WebFetchTool } from '../../../tools/WebFetchTool/WebFetchTool.js'
import { shouldShowAlwaysAllowOptions } from '../../../utils/permissions/permissionsLoader.js'
import { Select } from '../../CustomSelect/select.js'
import { usePermissionRequestLogging } from '../hooks.js'
import { PermissionDialog } from '../PermissionDialog.js'
import type { PermissionRequestProps } from '../PermissionRequest.js'
import { PermissionRuleExplanation } from '../PermissionRuleExplanation.js'
import { useDangerousModeConfirmation } from '../useDangerousModeConfirmation.js'
import { logUnaryPermissionEvent } from '../utils.js'

type WebFetchOptionValue = 'yes' | 'yes-dont-ask-again-domain' | 'yes-full-access' | 'no'

function inputToPermissionRuleContent(input: { [k: string]: unknown }): string {
  try {
    const parsedInput = WebFetchTool.inputSchema.safeParse(input)
    if (!parsedInput.success) {
      return `input:${input.toString()}`
    }

    const hostname = new URL(parsedInput.data.url).hostname
    return `domain:${hostname}`
  } catch {
    return `input:${input.toString()}`
  }
}

export function WebFetchPermissionRequest({
  toolUseConfirm,
  onDone,
  onReject,
  verbose,
  workerBadge,
}: PermissionRequestProps) {
  const [theme] = useTheme()
  const isDangerousModeAvailable = useAppState(
    s => s.toolPermissionContext.isBypassPermissionsModeAvailable,
  )
  const { confirmDangerousMode, dangerousModeDialog } =
    useDangerousModeConfirmation()

  const { url } = toolUseConfirm.input as { url: string }
  const hostname = new URL(url).hostname

  usePermissionRequestLogging(toolUseConfirm, {
    completion_type: 'tool_use_single',
    language_name: 'none',
  })

  const options = useMemo(() => {
    const nextOptions = [
      {
        label: 'Yes',
        value: 'yes' as const,
      },
    ]

    if (shouldShowAlwaysAllowOptions()) {
      nextOptions.push({
        label: <Text>Yes, and don&apos;t ask again for <Text bold>{hostname}</Text></Text>,
        value: 'yes-dont-ask-again-domain' as const,
      })

      if (isDangerousModeAvailable) {
        nextOptions.push({
          label: (
            <Text color="error">
              Yes, and enable Full Access for this session
            </Text>
          ),
          value: 'yes-full-access' as const,
        })
      }
    }

    nextOptions.push({
      label: (
        <Text>
          No, and tell Claude what to do differently <Text bold>(esc)</Text>
        </Text>
      ),
      value: 'no' as const,
    })

    return nextOptions
  }, [hostname, isDangerousModeAvailable])

  const onChange = (newValue: WebFetchOptionValue) => {
    switch (newValue) {
      case 'yes':
        logUnaryPermissionEvent('tool_use_single', toolUseConfirm, 'accept')
        toolUseConfirm.onAllow(toolUseConfirm.input, [])
        onDone()
        return

      case 'yes-dont-ask-again-domain': {
        logUnaryPermissionEvent('tool_use_single', toolUseConfirm, 'accept')
        const ruleContent = inputToPermissionRuleContent(toolUseConfirm.input)
        toolUseConfirm.onAllow(toolUseConfirm.input, [
          {
            type: 'addRules',
            rules: [{ toolName: toolUseConfirm.tool.name, ruleContent }],
            behavior: 'allow',
            destination: 'localSettings',
          },
        ])
        onDone()
        return
      }

      case 'yes-full-access':
        logUnaryPermissionEvent('tool_use_single', toolUseConfirm, 'accept')
        confirmDangerousMode('fullAccess', () => {
          toolUseConfirm.onAllow(toolUseConfirm.input, [
            {
              type: 'setMode',
              mode: 'fullAccess',
              destination: 'session',
            },
          ])
          onDone()
        })
        return

      case 'no':
        logUnaryPermissionEvent('tool_use_single', toolUseConfirm, 'reject')
        toolUseConfirm.onReject()
        onReject()
        onDone()
        return
    }
  }

  if (dangerousModeDialog) {
    return dangerousModeDialog
  }

  return (
    <PermissionDialog title="Fetch" workerBadge={workerBadge}>
      <Box flexDirection="column" paddingX={2} paddingY={1}>
        <Text>
          {WebFetchTool.renderToolUseMessage(
            toolUseConfirm.input as { url: string; prompt: string },
            { theme, verbose },
          )}
        </Text>
        <Text dimColor>{toolUseConfirm.description}</Text>
      </Box>
      <Box flexDirection="column">
        <PermissionRuleExplanation
          permissionResult={toolUseConfirm.permissionResult}
          toolType="tool"
        />
        <Text>Do you want to allow Claude to fetch this content?</Text>
        <Select
          options={options}
          onChange={onChange}
          onCancel={() => onChange('no')}
        />
      </Box>
    </PermissionDialog>
  )
}
