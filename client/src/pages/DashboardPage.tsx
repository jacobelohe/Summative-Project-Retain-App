import { useCallback, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Button, Grid, LinearProgress, Link } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import SavingsOutlinedIcon from '@mui/icons-material/SavingsOutlined'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import DonutLargeOutlinedIcon from '@mui/icons-material/DonutLargeOutlined'
import { dashboardApi } from '../api/dashboard'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../hooks/useAuth'
import { PageHeader } from '../components/common/PageHeader'
import { MonthPicker } from '../components/common/MonthPicker'
import { StatCard } from '../components/common/StatCard'
import { SectionCard } from '../components/common/SectionCard'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorAlert } from '../components/common/ErrorAlert'
import { EmptyState } from '../components/common/EmptyState'
import { BudgetProgress } from '../components/budget/BudgetProgress'
import { CategoryDonut } from '../components/charts/CategoryDonut'
import { RecentExpenses } from '../components/expenses/RecentExpenses'
import { currentMonth, formatMoney, formatMonth } from '../utils/format'

export default function DashboardPage() {
  const { user } = useAuth()
  const [month, setMonth] = useState(currentMonth)
  const fetcher = useCallback(() => dashboardApi.summary(month), [month])
  const { data: summary, loading, error, reload } = useApi(fetcher)

  const firstName = user?.name.split(' ')[0] ?? ''

  return (
    <>
      <PageHeader
        title={`Hi ${firstName} 👋`}
        subtitle={`Here's your spending for ${formatMonth(month)}.`}
        actions={
          <>
            <MonthPicker value={month} onChange={setMonth} />
            <Button component={RouterLink} to="/expenses/new" variant="contained" startIcon={<AddIcon />}>
              Add expense
            </Button>
          </>
        }
      />

      {error && <ErrorAlert message={error} onRetry={reload} />}
      {loading && summary && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

      {!summary ? (
        loading && <LoadingState label="Loading your dashboard…" />
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Total spent"
              value={formatMoney(summary.totalSpent)}
              caption={`${summary.expenseCount} expense${summary.expenseCount === 1 ? '' : 's'} this month`}
              icon={<AccountBalanceWalletOutlinedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Remaining budget"
              value={summary.remaining === null ? '—' : formatMoney(summary.remaining)}
              caption={
                summary.budget === null ? (
                  <Link component={RouterLink} to="/budget">
                    Set a budget
                  </Link>
                ) : (
                  `of ${formatMoney(summary.budget)} budget`
                )
              }
              icon={<SavingsOutlinedIcon />}
              color={summary.status === 'over' ? 'error.main' : summary.status === 'approaching' ? 'warning.main' : 'success.main'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Highest expense"
              value={summary.highestExpense ? formatMoney(summary.highestExpense.amount) : '—'}
              caption={summary.highestExpense?.title ?? 'No expenses this month'}
              icon={<TrendingUpIcon />}
              color="secondary.main"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <StatCard
              label="Top category"
              value={summary.byCategory[0]?.name ?? '—'}
              caption={summary.byCategory[0] ? formatMoney(summary.byCategory[0].total) : 'Nothing spent yet'}
              icon={<DonutLargeOutlinedIcon />}
            />
          </Grid>

          <Grid size={12}>
            <SectionCard
              title="Monthly budget"
              action={
                <Button component={RouterLink} to="/budget" size="small">
                  {summary.budget === null ? 'Set budget' : 'Manage'}
                </Button>
              }
            >
              <BudgetProgress overview={summary} />
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, md: 7 }}>
            <SectionCard title="Spending by category">
              {summary.byCategory.length ? (
                <CategoryDonut data={summary.byCategory} />
              ) : (
                <EmptyState title="No spending this month" description="Expenses you add for this month will appear here." />
              )}
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <SectionCard
              title="Recent expenses"
              flush
              action={
                <Button component={RouterLink} to="/expenses" size="small">
                  View all
                </Button>
              }
            >
              {summary.recentExpenses.length ? (
                <Box sx={{ pb: 1 }}>
                  <RecentExpenses expenses={summary.recentExpenses} />
                </Box>
              ) : (
                <EmptyState
                  icon={<ReceiptLongOutlinedIcon />}
                  title="No expenses yet"
                  action={
                    <Button component={RouterLink} to="/expenses/new" variant="outlined" size="small">
                      Add your first expense
                    </Button>
                  }
                />
              )}
            </SectionCard>
          </Grid>
        </Grid>
      )}
    </>
  )
}
