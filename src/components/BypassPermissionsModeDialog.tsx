import { c as _c } from "react-compiler-runtime";
import React from 'react';
import { logEvent } from 'src/services/analytics/index.js';
import { Box, Link, Newline, Text } from '../ink.js';
import { gracefulShutdownSync } from '../utils/gracefulShutdown.js';
import { persistDangerousModeAcceptance } from '../utils/permissions/dangerousModePromptRuntime.js';
import { Select } from './CustomSelect/index.js';
import { Dialog } from './design-system/Dialog.js';
import {
  type PermissionMode,
  permissionModeTitle,
} from '../utils/permissions/PermissionMode.js';
type Props = {
  mode?: Extract<PermissionMode, 'bypassPermissions' | 'fullAccess'>;
  onAccept(): void;
};
export function BypassPermissionsModeDialog(t0: Props) {
  const $ = _c(12);
  const {
    mode = 'bypassPermissions',
    onAccept
  } = t0;
  let t1: [];
  if ($[0] === Symbol.for("react.memo_cache_sentinel")) {
    t1 = [];
    $[0] = t1;
  } else {
    t1 = $[0];
  }
  React.useEffect(_temp, t1);
  let t2;
  if ($[1] !== mode || $[2] !== onAccept) {
    t2 = function onChange(value: 'accept' | 'decline') {
      bb3: switch (value) {
        case "accept":
          {
            logEvent("tengu_bypass_permissions_mode_dialog_accept", {});
            persistDangerousModeAcceptance(mode);
            onAccept();
            break bb3;
          }
        case "decline":
          {
            gracefulShutdownSync(1);
          }
      }
    };
    $[1] = mode;
    $[2] = onAccept;
    $[3] = t2;
  } else {
    t2 = $[3];
  }
  const onChange = t2;
  const handleEscape = _temp2;
  let t3;
  if ($[4] !== mode) {
    const modeTitle = permissionModeTitle(mode);
    t3 = <Box flexDirection="column" gap={1}><Text>In {modeTitle} mode, Claude Code will not ask for your approval before running potentially dangerous commands.<Newline />This mode should only be used in a sandboxed container/VM that has restricted internet access and can easily be restored if damaged.</Text><Text>By proceeding, you accept all responsibility for actions taken while running in {modeTitle} mode.</Text><Link url="https://code.claude.com/docs/en/security" /></Box>;
    $[4] = mode;
    $[5] = t3;
  } else {
    t3 = $[5];
  }
  let t4;
  if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
    t4 = [{
      label: "No, exit",
      value: "decline"
    }, {
      label: "Yes, I accept",
      color: "error",
      value: "accept"
    }];
    $[6] = t4;
  } else {
    t4 = $[6];
  }
  let t5;
  if ($[7] !== mode || $[8] !== onChange || $[9] !== t3 || $[10] !== t4) {
    t5 = <Dialog title={`WARNING: Claude Code running in ${permissionModeTitle(mode)} mode`} color="error" onCancel={handleEscape}>{t3}<Select options={t4} onChange={(value_0: string) => onChange(value_0 as 'accept' | 'decline')} /></Dialog>;
    $[7] = mode;
    $[8] = onChange;
    $[9] = t3;
    $[10] = t4;
    $[11] = t5;
  } else {
    t5 = $[11];
  }
  return t5;
}
function _temp2() {
  gracefulShutdownSync(0);
}
function _temp() {
  logEvent("tengu_bypass_permissions_mode_dialog_shown", {});
}
