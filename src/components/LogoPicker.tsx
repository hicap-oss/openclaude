import * as React from 'react'
import { Box, Text } from '../ink.js'
import { Select } from './CustomSelect/index.js'
import {
  LOGO_PALETTE_NAMES,
  LOGO_PALETTES,
  type LogoPaletteName,
} from './StartupScreen.palettes.js'
import { rgb, ANSI_RESET } from './StartupScreen.js'

export type LogoPickerProps = {
  initial?: LogoPaletteName
  onSelect: (name: LogoPaletteName) => void
  onCancel: () => void
}

const PRESET_LABELS: Record<LogoPaletteName, string> = {
  sunset: 'Sunset (default)',
  forest: 'Forest green',
  ocean: 'Ocean blue',
  mono: 'Monochrome',
}

/**
 * Render a colored preview swatch using the palette's gradient stops.
 * Six block characters, one per gradient stop — gives an immediate sense
 * of the palette's range without re-painting the full ASCII logo.
 */
function previewSwatch(name: LogoPaletteName): string {
  const stops = LOGO_PALETTES[name].gradient
  return stops
    .map(([r, g, b]) => `${rgb(r, g, b)}\u2587${ANSI_RESET}`)
    .join('')
}

export function LogoPicker({
  initial,
  onSelect,
  onCancel,
}: LogoPickerProps): React.ReactElement {
  const options = React.useMemo(
    () =>
      LOGO_PALETTE_NAMES.map(name => ({
        label: `${previewSwatch(name)}  ${PRESET_LABELS[name]}`,
        value: name,
      })),
    [],
  )

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Choose the startup logo color scheme</Text>
      <Select
        options={options}
        onChange={value => onSelect(value as LogoPaletteName)}
        onCancel={onCancel}
        visibleOptionCount={options.length}
        defaultValue={initial}
        defaultFocusValue={initial}
      />
    </Box>
  )
}
