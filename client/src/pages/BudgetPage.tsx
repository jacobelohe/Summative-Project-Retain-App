import { useCallback, useState, type FormEvent } from 'react'
import {
  Alert,
  Box,
  Button,
  Grid,
  InputAdornment,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { budgetsApi } from '../api/budgets'
import { getErrorMessage } from '../api/client'
import { useApi } from '../hooks/useApi'
import { useNotify } from '../hooks/useNotify'
import { PageHeader } from '../components/common/PageHeader'
import { MonthPicker } from '../components/common/MonthPicker'
import { SectionCard } from '../components/common/SectionCard'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorAlert } from '../components/common/ErrorAlert'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { BudgetProgress } from '../components/budget/BudgetProgress'
import { currentMonth, formatMoney, formatMonth } from '../utils/format'
import type { BudgetOverview } from '../types'

interface BudgetFormProps {
  overview: BudgetOverview
  onSaved: (overview: BudgetOverview) => void
}

/** Set / update / clear form. Re-mounted per month so it starts from that month's value. */
function BudgetForm({ overview, onSaved }: BudgetFormProps) {
  const notify = useNotify()
  const [amount, setAmount] = useState(overview.budget === null ? '' : String(overview.budget))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const value = Number(amount)
    if (amount.trim() === '' || !Number.isFinite(value) || value < 0) {
      setError('Enter a budget of 0 or more')
      return
    }
    setError(null)
    setSaving(true)
    try {
      const updated = await budgetsApi.set(overview.month, Math.round(value * 100) / 100)
      onSaved(updated)
      notify(`Budget for ${formatMonth(overview.month)} saved`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    setSaving(true)
    try {
      const updated = await budgetsApi.clear(overview.month)
      onSaved(updated)
      setAmount('')
      setConfirmClear(false)
      notify('Budget removed')
    } catch (err) {
      notify(getErrorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {overview.budget === null
          ? `You haven't set a budget for ${formatMonth(overview.month)} yet.`
          : `Your budget for ${formatMonth(overview.month)} is ${formatMoney(overview.budget)}.`}
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <TextField
        label="Monthly budget"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        fullWidth
        slotProps={{
          htmlInput: { min: 0, step: '0.01', inputMode: 'decimal' },
          input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
        }}
      />
      <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {overview.budget !== null && (
          <Button color="error" onClick={() => setConfirmClear(true)} disabled={saving}>
            Remove budget
          </Button>
        )}
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? 'Saving…' : overview.budget === null ? 'Set budget' : 'Update budget'}
        </Button>
      </Box>
      <ConfirmDialog
        open={confirmClear}
        title="Remove budget?"
        message={`The budget for ${formatMonth(overview.month)} will be removed. Your expenses are not affected.`}
        confirmLabel="Remove"
        destructive
        busy={saving}
        onConfirm={handleClear}
        onClose={() => setConfirmClear(false)}
      />
    </Box>
  )
}

export default function BudgetPage() {
  const [month, setMonth] = useState(currentMonth)
  const overviewFetcher = useCallback(() => budgetsApi.get(month), [month])
  const overview = useApi(overviewFetcher)
  const historyFetcher = useCallback(() => budgetsApi.list(), [])
  const history = useApi(historyFetcher)

  const handleSaved = (updated: BudgetOverview) => {
    overview.setData(() => updated)
    history.reload()
  }

  return (
    <>
      <PageHeader
        title="Monthly budget"
        subtitle="Set a spending limit for each month and see how close you are to it."
        actions={<MonthPicker value={month} onChange={setMonth} />}
      />

      {overview.error && <ErrorAlert message={overview.error} onRetry={overview.reload} />}

      {!overview.data ? (
        overview.loading && <LoadingState label="Loading budget…" />
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 5 }}>
            <SectionCard title={overview.data.budget === null ? 'Set budget' : 'Update budget'}>
              <BudgetForm key={overview.data.month} overview={overview.data} onSaved={handleSaved} />
            </SectionCard>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <SectionCard title={`Status for ${formatMonth(overview.data.month)}`}>
              {overview.loading && <LinearProgress sx={{ mb: 2 }} />}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  ['Budget', overview.data.budget === null ? '—' : formatMoney(overview.data.budget)],
                  ['Spent', formatMoney(overview.data.totalSpent)],
                  ['Remaining', overview.data.remaining === null ? '—' : formatMoney(overview.data.remaining)],
                ].map(([label, value]) => (
                  <Grid key={label} size={4}>
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography
                      variant="h6"
                      className="num"
                      color={label === 'Remaining' && (overview.data?.remaining ?? 0) < 0 ? 'error' : 'text.primary'}
                    >
                      {value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
              <BudgetProgress overview={overview.data} />
            </SectionCard>
          </Grid>

          <Grid size={12}>
            <SectionCard title="Budget history" flush>
              {history.data && history.data.length > 0 ? (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Month</TableCell>
                        <TableCell align="right">Budget</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.data.map((b) => (
                        <TableRow key={b.id} selected={b.month === month}>
                          <TableCell>{formatMonth(b.month)}</TableCell>
                          <TableCell align="right" className="num">
                            {formatMoney(b.amount)}
                          </TableCell>
                          <TableCell align="right">
                            <Button size="small" onClick={() => setMonth(b.month)} disabled={b.month === month}>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ) : (
                <Typography color="text.secondary" variant="body2" sx={{ px: 2.5, pb: 2.5 }}>
                  {history.loading ? 'Loading…' : 'No budgets set yet.'}
                </Typography>
              )}
            </SectionCard>
          </Grid>
        </Grid>
      )}
    </>
  )
}
