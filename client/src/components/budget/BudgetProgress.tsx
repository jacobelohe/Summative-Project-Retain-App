import { Box, Chip, LinearProgress, Typography } from '@mui/material'
import { formatMoney } from '../../utils/format'
import type { BudgetOverview } from '../../types'
import { BUDGET_STATUS_META } from './budgetStatus'

/** Progress bar of spending vs. budget, coloured by budget status. */
export function BudgetProgress({ overview }: { overview: BudgetOverview }) {
  const meta = BUDGET_STATUS_META[overview.status]
  const percent = overview.percentUsed ?? 0
  const barColor = meta.color === 'default' ? 'primary' : meta.color

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
        <Chip label={meta.label} color={meta.color} size="small" />
        {overview.budget !== null && (
          <Typography variant="body2" color="text.secondary" className="num">
            {formatMoney(overview.totalSpent)} of {formatMoney(overview.budget)} · {percent.toFixed(0)}%
          </Typography>
        )}
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, percent)}
        color={barColor}
        aria-label="Budget used"
        sx={{ height: 10, borderRadius: 5 }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        {overview.status === 'over' && overview.remaining !== null
          ? `${formatMoney(Math.abs(overview.remaining))} over budget. ${meta.description}`
          : overview.remaining !== null
            ? `${formatMoney(overview.remaining)} left to spend this month.`
            : meta.description}
      </Typography>
    </Box>
  )
}
