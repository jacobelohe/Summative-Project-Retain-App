import { useCallback } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from '@mui/material'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import { adminApi } from '../../api/dashboard'
import { useApi } from '../../hooks/useApi'
import { PageHeader } from '../../components/common/PageHeader'
import { StatCard } from '../../components/common/StatCard'
import { SectionCard } from '../../components/common/SectionCard'
import { LoadingState } from '../../components/common/LoadingState'
import { ErrorAlert } from '../../components/common/ErrorAlert'
import { EmptyState } from '../../components/common/EmptyState'
import { CategoryBarChart } from '../../components/charts/CategoryBarChart'
import { CategoryRanking } from '../../components/admin/CategoryRanking'
import { RecentExpenses } from '../../components/expenses/RecentExpenses'
import { currentMonth, formatDate, formatDateTime, formatMoney, formatMonth } from '../../utils/format'

export default function AdminDashboardPage() {
  const fetcher = useCallback(() => adminApi.insights(), [])
  const { data: insights, loading, error, reload } = useApi(fetcher)

  if (!insights) {
    return (
      <>
        <PageHeader title="Platform insights" subtitle="How people are using Retain." />
        {error ? <ErrorAlert message={error} onRetry={reload} /> : loading && <LoadingState label="Loading insights…" />}
      </>
    )
  }

  const { totals } = insights
  const maxCount = insights.topCategories[0]?.count ?? 0
  const spending = insights.spendingByCategory.filter((c) => c.total > 0)

  return (
    <>
      <PageHeader
        title="Platform insights"
        subtitle="How people are using Retain across the whole platform."
        actions={
          <>
            <Button onClick={reload} disabled={loading}>
              Refresh
            </Button>
            <Button component={RouterLink} to="/admin/categories" variant="contained">
              Manage categories
            </Button>
          </>
        }
      />
      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}
      {error && <ErrorAlert message={error} onRetry={reload} />}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Registered users" value={totals.users.toLocaleString()} icon={<PeopleAltOutlinedIcon />} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Expenses recorded"
            value={totals.expenses.toLocaleString()}
            icon={<ReceiptLongOutlinedIcon />}
            color="secondary.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Total value recorded"
            value={formatMoney(totals.value)}
            icon={<AccountBalanceWalletOutlinedIcon />}
            color="success.main"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            label="Expenses this month"
            value={totals.expensesThisMonth.toLocaleString()}
            caption={formatMonth(currentMonth())}
            icon={<CalendarMonthOutlinedIcon />}
            color="warning.main"
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard title="Total spending per category">
            {spending.length ? (
              <CategoryBarChart data={spending} />
            ) : (
              <EmptyState title="No spending recorded yet" />
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SectionCard title="Top 5 most-used">
            <Typography variant="caption" color="text.secondary">
              Ranked by number of expenses
            </Typography>
            <CategoryRanking categories={insights.topCategories} maxCount={maxCount} />
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SectionCard title="Bottom 5 least-used">
            <Typography variant="caption" color="text.secondary">
              Ranked by number of expenses
            </Typography>
            <CategoryRanking categories={insights.bottomCategories} maxCount={maxCount} />
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard title="Recently added expenses" flush>
            {insights.recentExpenses.length ? (
              <Box sx={{ pb: 1 }}>
                <RecentExpenses
                  expenses={insights.recentExpenses}
                  linkToDetail={false}
                  secondary={(e) =>
                    `${e.user?.name ?? 'Deleted user'} · ${e.category?.name ?? 'Uncategorized'} · ${formatDate(e.date)}`
                  }
                />
              </Box>
            ) : (
              <EmptyState title="No expenses yet" />
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard title="Recently registered users" flush>
            <List disablePadding sx={{ pb: 1 }}>
              {insights.recentUsers.map((u) => (
                <ListItem
                  key={u.id}
                  divider
                  secondaryAction={u.role === 'admin' ? <Chip label="Admin" size="small" color="secondary" /> : undefined}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.light', width: 36, height: 36, fontSize: 14 }}>
                      {u.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={u.name}
                    secondary={`${u.email} · joined ${formatDateTime(u.createdAt)}`}
                    slotProps={{ primary: { noWrap: true }, secondary: { noWrap: true } }}
                    sx={{ minWidth: 0, pr: u.role === 'admin' ? 6 : 0 }}
                  />
                </ListItem>
              ))}
            </List>
          </SectionCard>
        </Grid>
      </Grid>
    </>
  )
}
