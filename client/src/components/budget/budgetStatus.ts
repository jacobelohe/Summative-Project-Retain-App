import type { BudgetStatus } from '../../types'

export const BUDGET_STATUS_META: Record<
  BudgetStatus,
  { label: string; color: 'success' | 'warning' | 'error' | 'default'; description: string }
> = {
  within: { label: 'Within budget', color: 'success', description: 'You have used less than 80% of your budget.' },
  approaching: {
    label: 'Approaching limit',
    color: 'warning',
    description: 'You have used 80% or more of your budget — slow down a little.',
  },
  over: { label: 'Over budget', color: 'error', description: 'You have spent more than your budget for this month.' },
  unset: { label: 'No budget set', color: 'default', description: 'Set a monthly budget to track how you are doing.' },
}
