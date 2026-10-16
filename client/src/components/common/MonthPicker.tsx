import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { currentMonth, formatMonth, shiftMonth } from '../../utils/format'

interface MonthPickerProps {
  /** `YYYY-MM` */
  value: string
  onChange: (month: string) => void
  /** Prevent navigating past the current month. */
  disableFuture?: boolean
}

export function MonthPicker({ value, onChange, disableFuture = false }: MonthPickerProps) {
  const atCurrent = value >= currentMonth()
  return (
    <Paper variant="outlined" sx={{ display: 'inline-flex', alignItems: 'center', px: 0.5, py: 0.25 }}>
      <Tooltip title="Previous month">
        <IconButton size="small" onClick={() => onChange(shiftMonth(value, -1))} aria-label="Previous month">
          <ChevronLeftIcon />
        </IconButton>
      </Tooltip>
      <Box sx={{ minWidth: 140, textAlign: 'center' }}>
        <Typography variant="subtitle2" component="span" aria-live="polite">
          {formatMonth(value)}
        </Typography>
      </Box>
      <Tooltip title="Next month">
        <span>
          <IconButton
            size="small"
            onClick={() => onChange(shiftMonth(value, 1))}
            disabled={disableFuture && atCurrent}
            aria-label="Next month"
          >
            <ChevronRightIcon />
          </IconButton>
        </span>
      </Tooltip>
    </Paper>
  )
}
